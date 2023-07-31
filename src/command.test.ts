import {expect, describe, it} from '@jest/globals';
import {Command, CommandParser} from '../src/command';

describe('commands', () => {
    it('parses extract command', async () => {
        const comment =
            'markdown-translation extract input_folder output_folder';

        const parser = new CommandParser(comment);

        const parsed = await parser.parse();

        expect(parsed[0] instanceof Command).toBeTruthy();
        expect(parsed[0]['name']).toStrictEqual('extract');
    });

    it('parses compose command', async () => {
        const comment =
            'markdown-translation compose input_folder output_folder';

        const parser = new CommandParser(comment);

        const parsed = await parser.parse();

        expect(parsed[0] instanceof Command).toBeTruthy();
        expect(parsed[0]['name']).toStrictEqual('compose');
    });

    it('empty on invalid command', async () => {
        const comment =
            'markdown-translation unknown input_folder output_folder';

        const parser = new CommandParser(comment);

        const parsed = await parser.parse();
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(0);
    });

    it('empty on invalid ci keyword', async () => {
        const comment =
            'markdown-shmarkdown extract input_folder output_folder';

        const parser = new CommandParser(comment);

        const parsed = await parser.parse();
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(0);
    });

    it('empty on empty string', async () => {
        const comment = '';

        const parser = new CommandParser(comment);

        const parsed = await parser.parse();
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(0);
    });

    it('parses multiple commands', async () => {
        const comment = `\
markdown-translation extract input_folder output_folder

markdown-translation compose input_folder output_folder`;

        const parser = new CommandParser(comment);

        const parsed = await parser.parse();
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(2);

        parsed.forEach(command => {
            expect(command instanceof Command).toBeTruthy();
        });
    });
});
