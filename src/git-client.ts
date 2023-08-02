import * as exec from '@actions/exec';
import * as core from '@actions/core';
import {ExecOptions} from '@actions/exec';

class GitClient {
    private username: string;
    private email: string;
    private configured: boolean;
    private stderr: string;
    private stdout: string;
    private options: ExecOptions;

    constructor(username?: string, email?: string) {
        this.username = username ?? 'moki';
        this.email = email ?? 'morozov.kirill.moki@gmail.com';
        this.configured = false;

        this.stderr = '';
        this.stdout = '';

        this.options = {
            listeners: {
                stderr: this.handleErr.bind(this),
                stdout: this.handleOut.bind(this),
            },
        };
    }

    private handleErr(this: GitClient, data: Buffer): void {
        this.stderr += data.toString();
    }

    private handleOut(this: GitClient, data: Buffer): void {
        this.stdout += data.toString();
    }

    private resetStreams(this: GitClient): void {
        this.stderr = this.stdout = '';
    }

    private async configure(): Promise<void> {
        const tasks = [
            exec.exec(`git config --global user.name ${this.username}`),
            exec.exec(`git config --global user.email ${this.email}`),
        ];

        await Promise.all(tasks);
        this.configured = true;
    }

    async add(pattern: string): Promise<void> {
        if (!pattern?.length) {
            throw new Error('specify files pattern');
        }
        if (!this.configured) {
            await this.configure();
        }

        this.resetStreams();

        await exec.exec(`git add ${pattern}`);
    }

    async commit(message: string): Promise<void> {
        if (!message?.length) {
            throw new Error('specify commit message');
        }
        if (!this.configured) {
            await this.configure();
        }

        this.resetStreams();

        try {
            await exec.exec(`git commit -m "${message}"`, [], this.options);
        } catch (err: unknown) {
            if (this.isEmptyCommit()) {
                core.debug('no changes since last commit');
            } else {
                throw err;
            }
        }
    }

    private isEmptyCommit(): boolean {
        const emptyErr = 'nothing to commit, working tree clean';

        return this.stdout.includes(emptyErr) || this.stderr.includes(emptyErr);
    }

    async push(remote?: string, src?: string): Promise<void> {
        if (!this.configured) {
            await this.configure();
        }

        this.resetStreams();

        let cmd = 'git push';
        if (!(remote?.length || src?.length)) {
            await exec.exec(cmd);
            return;
        }

        if (!(remote?.length && src?.length)) {
            throw new Error('specify both remote and src');
        }

        cmd += `${remote} ${src}`;

        await exec.exec(cmd);
    }
}

export {GitClient};
export default {GitClient};
