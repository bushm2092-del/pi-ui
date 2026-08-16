interface ComposerKeyInput {
  key: string;
  shiftKey: boolean;
  isComposing: boolean;
}

export function shouldSubmitComposer(input: ComposerKeyInput) {
  return input.key === "Enter" && !input.shiftKey && !input.isComposing;
}
