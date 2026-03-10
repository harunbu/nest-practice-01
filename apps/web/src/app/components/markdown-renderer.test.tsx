import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownRenderer } from "./markdown-renderer";

describe("MarkdownRenderer", () => {
  it("renders headings, emphasis, lists, code, and links", () => {
    render(
      <MarkdownRenderer
        content={[
          "# Heading",
          "",
          "This is **bold** and `inline code`.",
          "",
          "- first",
          "- second",
          "",
          "[OpenAI](https://openai.com)",
          "",
          "```ts",
          "const answer = 42;",
          "```",
        ].join("\n")}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Heading" }),
    ).toBeInTheDocument();
    expect(screen.getByText("bold")).toHaveProperty("tagName", "STRONG");
    expect(screen.getByText("inline code")).toHaveProperty("tagName", "CODE");
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "OpenAI" })).toHaveAttribute(
      "href",
      "https://openai.com",
    );
    expect(screen.getByText("const answer = 42;")).toBeInTheDocument();
  });
});
