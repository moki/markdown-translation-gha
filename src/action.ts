import * as core from '@actions/core';
import * as github from '@actions/github';
import {z} from 'zod';

import {usage} from './constants';

import {Context} from '@actions/github/lib/context';
import {GitHub} from '@actions/github/lib/utils';

export type ActionParameters = {
    githubToken: string;
    associations: string[];
};

class Action {
    private allowedAssociations: Set<string>;
    private parameters: ActionParameters;
    private octokit: InstanceType<typeof GitHub>;
    private context: Context;

    private static configuration = `action intended to be configured to run on triggers:
issue_comment(types:[created, edited])
pull_request(types:[opened])`;
    private static usage = usage;

    private static pull_request_event = 'pull_request';
    private static issue_comment_event = 'issue_comment';

    private static allowedPermissions = new Set(['admin', 'write']);

    constructor() {
        this.parameters = this.parseActionParameters();
        this.octokit = github.getOctokit(this.parameters.githubToken);
        this.context = github.context;
        this.allowedAssociations = new Set(this.parameters.associations);
    }

    private parseActionParameters(): ActionParameters {
        const githubToken = core.getInput('github-token', {required: true});

        let assocRaw = core.getInput('allowed-associations');
        if (!assocRaw?.length) {
            // default association is owner of the repository
            assocRaw = '["OWNER"]';
        }

        const parser = z.string().transform((str, ctx): string[] => {
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
        });

        const associations = parser.parse(assocRaw);

        core.debug(`parsed associations: ${associations}`);

        return {githubToken, associations};
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
        this.assertPermissions();
    }

    async assertPermissions(): Promise<void> {
        const permission = await this.actorPermission();
        if (!Action.allowedPermissions.has(permission)) {
            throw new Error('insufficient actor permissions');
        }

        core.debug(`actor: ${this.context.actor}, permission: ${permission}`);

        const association = await this.commentAuthorAssociation();
        if (!this.allowedAssociations.has(association)) {
            throw new Error('insufficient actor association');
        }

        core.debug(`actor: ${this.context.actor}, association: ${association}`);
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
