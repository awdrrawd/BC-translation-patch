const pronouns = {
    herself: "她自己",
    hers: "她的",
    she: "她",
    her: "她",
};

export const translatePronouns = (text) => {
    if (text in pronouns) {
        return pronouns[text];
    }
    return text;
};
