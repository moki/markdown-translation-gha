import * as core from '@actions/core';
import * as github from '@actions/github';
import {z} from 'zod';

import {usage} from './constants';

import {Context} from '@actions/github/lib/context';
import {GitHub} from '@actions/github/lib/utils';

import {Command, CommandParser, CommandExecutor} from './command';
import {GitClient} from './git-client';
import {GithubClient} from './github-client';
import {XLIFFClient} from './xliff-client';

export type ActionParameters = {
    githubToken: string;
    associations: string[];
};

class Action {
    private static configuration = `action intended to be configured to run on triggers:
issue_comment(types:[created, edited])
pull_request(types:[opened])`;
    private static usage = usage;

    private static pull_request_event = 'pull_request';
    private static issue_comment_event = 'issue_comment';

    private static allowedPermissions = new Set(['admin', 'write']);
    private static defaultAssociationsString = '["OWNER"]';

    private parameters: ActionParameters;
    private octokit: InstanceType<typeof GitHub>;
    private context: Context;
    private allowedAssociations: Set<string>;

    private commandsExecutor: CommandExecutor<unknown>;
    private commandsParser: CommandParser;

    private gitClient: GitClient;
    private githubClient: GithubClient;
    private xliffClient: XLIFFClient;

    constructor() {
        this.parameters = this.parseActionParameters();

        this.octokit = github.getOctokit(this.parameters.githubToken);
        this.context = github.context;

        this.allowedAssociations = new Set(this.parameters.associations);

        this.gitClient = new GitClient();
        this.githubClient = new GithubClient();
        this.xliffClient = new XLIFFClient();

        this.commandsExecutor = new CommandExecutor();

        this.commandsExecutor.addHandler(
            'extract',
            async (
                pr: string,
                input: string,
                output: string,
                sll: string,
                tll: string
            ) => {
                core.debug(`PR NUMBER: ${pr}`);
                await this.githubClient.checkoutPR(pr);
                await this.xliffClient.extract(input, output, sll, tll);
                await this.gitClient.add('.');
                await this.gitClient.commit(
                    'markdown-translation: extract xliff and skeleton'
                );
                await this.gitClient.push();
            }
        );

        this.commandsParser = new CommandParser();
    }

    private parseActionParameters(): ActionParameters {
        const githubToken = core.getInput('github-token', {required: true});

        let associationsString = core.getInput('allowed-associations');
        if (!associationsString?.length) {
            associationsString = Action.defaultAssociationsString;
        }

        const associations = this.parseAssociations(associationsString);

        return {githubToken, associations};
    }

    private parseAssociations(associations: string): string[] {
        const parser = (str: string, ctx: z.RefinementCtx): string[] => {
            try {
                const parsed = JSON.parse(str);

                return z.array(z.string()).parse(parsed);
            } catch (err) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'parsed value is not array of strings',
                });

                return z.NEVER;
            }
        };

        return z.string().transform(parser).parse(associations);
    }

    async run(): Promise<void> {
        const {eventName} = this.context;

        core.debug(`triggered ${eventName}`);

        if (eventName === Action.pull_request_event) {
            return this.handlePullRequest();
        } else if (eventName === Action.issue_comment_event) {
            return this.handleComment();
        }

        throw new Error(
            `${eventName} not implemented\n${Action.configuration}`
        );
    }

    async handlePullRequest(): Promise<void> {
        const {
            repo,
            payload: {pull_request},
        } = this.context;

        if (!(repo && pull_request)) {
            return;
        }

        await this.octokit.rest.issues.createComment({
            ...repo,
            issue_number: pull_request.number,
            body: Action.usage,
        });
    }

    async handleComment(): Promise<void> {
        core.debug('handling issue_comment');

        const {
            payload: {issue, comment},
        } = this.context;

        if (!(issue?.pull_request && comment)) {
            core.debug(
                `skip ${Action.issue_comment_event} event inside issues`
            );
            return;
        }

        this.assertPermissions();

        const addPRNumberParameter = (command: Command): Command => {
            command.parameters = [
                issue.number.toString(),
                ...command.parameters,
            ];
            return command;
        };

        const commands = await this.commandsParser.parse(comment.body);
        const results = await this.commandsExecutor.execute(
            commands.map(addPRNumberParameter)
        );

        for (const result of results) {
            const printable = JSON.stringify(result, null, 4);
            core.debug(printable);
        }
    }

    async assertPermissions(): Promise<void> {
        const permission = await this.actorPermission();
        if (!Action.allowedPermissions.has(permission)) {
            throw new Error('insufficient actor permissions');
        }

        const association = await this.commentAuthorAssociation();
        if (!this.allowedAssociations.has(association)) {
            throw new Error('insufficient actor association');
        }
    }

    async actorPermission(): Promise<string> {
        const res =
            await this.octokit.rest.repos.getCollaboratorPermissionLevel({
                ...this.context.repo,
                username: this.context.actor,
            });

        if (res.status !== 200) {
            throw new Error('failed to retrieve permission for actor');
        }

        return res.data.permission;
    }

    async commentAuthorAssociation(): Promise<string> {
        const {comment} = this.context.payload;
        if (!comment) {
            throw new Error('failed to retrieve comment author associations');
        }

        return comment.author_association;
    }
}

export {Action};
export default {Action};
