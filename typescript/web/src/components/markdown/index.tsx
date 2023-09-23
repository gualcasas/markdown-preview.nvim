import { useContext, useRef } from "react";
import { getFileName } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { CURSOR_LINE_ELEMENT_ID, MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider.tsx";
import { Container } from "../container.tsx";

export const Markdown = ({ className }: { className: string }) => {
    const { currentPath } = useContext(websocketContext);
    // We use refs, because we don't want these htmlelements ever to rerender
    const markdownElement = useRef(
        <div id={MARKDOWN_ELEMENT_ID} className="-mt-9 max-w-[1012px] mx-auto mb-96" />,
    );
    const cursorLineElement = useRef(
        <div id={CURSOR_LINE_ELEMENT_ID} className="absolute pointer-events-none w-full" />,
    );
    const fileName = getFileName(currentPath);

    return (
        <Container className={className}>
            <p className="!mb-0 p-4 text-sm font-semibold bg-github-border-muted h-[52px] sticky top-0 z-10">
                {fileName}
            </p>
            {markdownElement.current}
            {cursorLineElement.current}
        </Container>
    );
};
