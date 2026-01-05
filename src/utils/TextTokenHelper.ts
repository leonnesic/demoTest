export interface TextToken {
    name: string;
    index: number;
    length: number;
}

export interface TextPlanItem {
    entityId: string;
    name: string;
    index: number;
    length: number;
    payload: any;
}

export default class TextTokenHelper {
    /** Builds emoji placement plan based on dialogue tokens. */
    static build(
        dialogueEntityId: string,
        text: string,
        emojies: any[]
    ): TextPlanItem[] {
        const tokens = this.extractTokens(text, emojies);
        if (!tokens.length) return [];

        const counters: Record < string, number > = {};

        return tokens.map(token => {
            counters[token.name] = (counters[token.name] ?? 0) + 1;

            return {
                entityId: `emoji_${dialogueEntityId}_${token.name}_${counters[token.name]}`,
                name: token.name,
                index: token.index,
                length: token.length,
                payload: emojies.find(e => e.name === token.name) !
            };
        });
    }

    /** Scans text for emoji tokens defined in the payload. */
    private static extractTokens(
        text: string,
        emojies: any[]
    ): TextToken[] {
        const tokens: TextToken[] = [];

        for (const emoji of emojies) {
            const pattern = new RegExp(`\\{${emoji.name}\\}`, 'g');

            for (const match of text.matchAll(pattern)) {
                tokens.push({
                    name: emoji.name,
                    index: match.index!,
                    length: emoji.name.length + 2
                });
            }
        }

        return tokens.sort((a, b) => a.index - b.index);
    }

    /** Converts emoji pixel width to space width using scale. */
    static getSpaceWidth(
        emojiPixelWidth: number,
        scale: number
    ): number {
        return emojiPixelWidth * scale;
    }
}