import * as exec from '@actions/exec';

class GitClient {
    private username: string;
    private email: string;
    private configured: boolean;

    constructor(username?: string, email?: string) {
        this.username = username ?? 'moki';
        this.email = email ?? 'morozov.kirill.moki@gmail.com';
        this.configured = false;
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

        await exec.exec(`git add ${pattern}`);
    }

    async commit(message: string): Promise<void> {
        if (!message?.length) {
            throw new Error('specify commit message');
        }
        if (!this.configured) {
            await this.configure();
        }

        await exec.exec(`git commit -m "${message}"`);
    }

    async push(remote?: string, src?: string): Promise<void> {
        if (!this.configured) {
            await this.configure();
        }

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
