import {expect, describe, it} from '@jest/globals';
import {Command, CommandParser, CommandExecutor} from '../src/command';

describe('commands parser', () => {
    it('parses extract command', async () => {
        const comment =
            'markdown-translation extract input_folder output_folder';

        const parser = new CommandParser();

        const parsed = await parser.parse(comment);

        expect(parsed[0] instanceof Command).toBeTruthy();
        expect(parsed[0]['name']).toStrictEqual('extract');
    });

    it('parses compose command', async () => {
        const comment =
            'markdown-translation compose input_folder output_folder';

        const parser = new CommandParser();

        const parsed = await parser.parse(comment);

        expect(parsed[0] instanceof Command).toBeTruthy();
        expect(parsed[0]['name']).toStrictEqual('compose');
    });

    it('empty on invalid command', async () => {
        const comment =
            'markdown-translation unknown input_folder output_folder';

        const parser = new CommandParser();

        const parsed = await parser.parse(comment);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(0);
    });

    it('empty on invalid ci keyword', async () => {
        const comment =
            'markdown-shmarkdown extract input_folder output_folder';

        const parser = new CommandParser();

        const parsed = await parser.parse(comment);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(0);
    });

    it('empty on empty string', async () => {
        const comment = '';

        const parser = new CommandParser();

        const parsed = await parser.parse(comment);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(0);
    });

    it('parses multiple commands', async () => {
        const comment = `\
markdown-translation extract input_folder output_folder

markdown-translation compose input_folder output_folder`;

        const parser = new CommandParser();

        const parsed = await parser.parse(comment);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(2);

        parsed.forEach(command => {
            expect(command instanceof Command).toBeTruthy();
        });
    });

    it('parses command from multiline comment', async () => {
        const comment = `\
Hello there, everyone!

Paragaph with \`inline code\` and [link](somewhere.md "title")

markdown-translation extract input_folder output_folder

content after markdown-translation command`;

        const parser = new CommandParser();

        const parsed = await parser.parse(comment);

        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(1);

        const command = parsed[0];
        expect(command instanceof Command).toBeTruthy();
    });
});

describe('executor', () => {
    it('executes commands', async () => {
        const executor = new CommandExecutor();

        executor.addHandler(
            'extract',
            async (...parameters): Promise<string[]> => {
                return parameters;
            }
        );

        executor.addHandler(
            'compose',
            async (...parameters): Promise<string> => {
                return 'rv';
            }
        );

        const commands = [
            new Command('extract', [
                'extract-parameter 1',
                'extract-parameter 2',
            ]),
            new Command('compose', []),
        ];

        const results = await executor.execute(commands);

        expect(Array.isArray(results)).toBeTruthy();
        expect(results.length).toStrictEqual(2);
        expect(results[0]).toStrictEqual([
            'extract-parameter 1',
            'extract-parameter 2',
        ]);
        expect(results[1]).toStrictEqual('rv');
    });
});
