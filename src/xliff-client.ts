import * as exec from '@actions/exec';

class XLIFFClient {
    private configured: boolean;

    constructor() {
        this.configured = false;
    }

    async configure(): Promise<void> {
        await exec.exec('npm install @doc-tools/docs -g');
        this.configured = true;
    }

    async extract(
        input: string,
        output: string,
        sourceLanguageLocale?: string,
        targetLanguageLocale?: string
    ): Promise<void> {
        if (!(input.length && output.length)) {
            throw new Error('specify input and output');
        }

        if (!this.configured) {
            await this.configure();
        }

        let sll = 'ru-RU';
        if (sourceLanguageLocale?.length) {
            sll = sourceLanguageLocale;
        }

        let tll = 'en-US';
        if (targetLanguageLocale?.length) {
            tll = targetLanguageLocale;
        }

        const cmd = `yfm xliff extract --input ${input} --output ${output} --sll ${sll} --tll ${tll}`;

        await exec.exec(cmd);
    }

    async compose(input: string, output: string): Promise<void> {
        if (!(input.length && output.length)) {
            throw new Error('specify input and output');
        }

        if (!this.configured) {
            await this.configure();
        }

        const cmd = `yfm xliff compose --input ${input} --output ${output}`;

        await exec.exec(cmd);
    }
}

export {XLIFFClient};
export default {XLIFFClient};
