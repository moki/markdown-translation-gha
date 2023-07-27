import * as core from '@actions/core';
import * as github from '@actions/github';

import {Context} from '@actions/github/lib/context';
import {GitHub} from '@actions/github/lib/utils';

export type ActionParameters = {
    githubToken: string;
    name: string;
};

class Action {
    private parameters: ActionParameters;
    private octokit: InstanceType<typeof GitHub>;
    private context: Context;

    private static pull_request_event = 'pull_request';
    private static issue_comment_event = 'issue_comment';
    private static usage = `action intended to be ran on triggers:
issue_comment(types:[created, edited]), pull_request(types:[opened])`;

    constructor() {
        this.parameters = this.parseActionParameters();
        this.octokit = github.getOctokit(this.parameters.githubToken);
        this.context = github.context;
    }

    private parseActionParameters(): ActionParameters {
        const githubToken = core.getInput('github-token', {required: true});
        const name = core.getInput('name', {required: true});

        return {githubToken, name};
    }

    async run(): Promise<void> {
        const {name} = this.parameters;

        core.debug(`Hello, ${name}`);

        const {eventName} = this.context;

        core.debug(`triggered ${eventName}`);

        if (eventName === Action.pull_request_event) {
            core.debug('handling pull_request');
            return;
        } else if (eventName === Action.issue_comment_event) {
            core.debug('handling issue_comment');
            return;
        }

        throw new Error(`${eventName} not implemented\n${Action.usage}`);
    }
}

export {Action};
export default {Action};
