import { createStarryNight } from "@wooorm/starry-night";
import { toHtml } from "hast-util-to-html";
import markdownIt from "markdown-it";
import languages from "../../../languages";
import copyBlockPlugin from "./copy-block";
import { starryNightGutter } from "./gutter";
import injectLinenumbersPlugin from "./linenumbers";
import localImage from "./local-image";
import relativeLinks from "./relative-links";

const starryNight = await createStarryNight(languages);

export function markdownToHtml(markdown: string) {
    const markdownItInstance = markdownIt({
        highlight(value, lang) {
            const scope = starryNight.flagToScope(lang);

            return toHtml({
                type: "element",
                tagName: "pre",
                properties: {
                    className: scope
                        ? [
                              "highlight",
                              "highlight-" +
                                  scope
                                      .replace(/^source\./, "")
                                      .replace(/\./g, "-"),
                          ]
                        : undefined,
                },
                // eslint-disable-next-line
                // @ts-ignore
                children: scope
                    ? starryNightGutter(starryNight.highlight(value, scope))
                          .children
                    : [{ type: "text", value }],
            });
        },
    })
        .use(copyBlockPlugin)
        .use(localImage)
        .use(injectLinenumbersPlugin)
        .use(relativeLinks);

    return markdownItInstance.render(markdown);
}