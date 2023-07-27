import * as core from '@actions/core';
import * as github from '@actions/github';

import {usage} from './constants';

import {Context} from '@actions/github/lib/context';
import {GitHub} from '@actions/github/lib/utils';

export type ActionParameters = {
    githubToken: string;
};
class Action {
    private parameters: ActionParameters;
    private octokit: InstanceType<typeof GitHub>;
    private context: Context;

    private static pull_request_event = 'pull_request';
    private static issue_comment_event = 'issue_comment';
    private static configuration = `action intended to be configured to run on triggers:
issue_comment(types:[created, edited])
pull_request(types:[opened])`;
    private static usage = usage;

    constructor() {
        this.parameters = this.parseActionParameters();
        this.octokit = github.getOctokit(this.parameters.githubToken);
        this.context = github.context;
    }

    private parseActionParameters(): ActionParameters {
        const githubToken = core.getInput('github-token', {required: true});

        return {githubToken};
    }

    async run(): Promise<void> {
        const {eventName} = this.context;

        core.debug(`triggered ${eventName}`);

        if (eventName === Action.pull_request_event) {
            return this.handlePullRequest();
        } else if (eventName === Action.issue_comment_event) {
            core.debug('handling issue_comment');
            return;
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
}

export {Action};
export default {Action};
