/**
 * Matches a number string exactly. The match can be parsed directly with Number(match)
 * @valid "1", "69"," 420", "-10"
 * @invalid "how about 123098123", "10,000"
 */
export const NUMBER_REGEX = /^-?\d+$/u;

/**
 * A zero-width space character that is invisible but still counts as a character.
 */
// fun fact, copilot autocompleted this. lol
export const ZERO_WIDTH_SPACE = '​';

export const DEFAULT_TICKET_RESPONSE = `
{responder.embed 
    timestamp={time}
    description="Thanks for opening a ticket, {user.mention;{ticket.authorId}}. We've received your request and will get back to you as soon as possible."
    footer="Thanks for being patient!"
}
[#if;{ticket.reason}]
    // Add the ticket reason only if it is not empty
    {responder.embedField name="Reason" value={ticket.reason}}
[/if]
`.trim();

export const DEFAULT_TICKET_TOPIC = `
Opened by {user.username} {if;{ticket.reason};for "{ticket.reason}"}
`.trim();

export const DEFAULT_SUGGESTION_PENDING_NOTIFICATION = `
{responder.embed
    title="Suggestion Pending"
    color="yellow"
    description="Your suggestion (\`{snippet;{suggestion.content};32}\`) is pending approval from a moderator."
    footer="Suggestion {suggestion.id}"
}
`.trim();

export const DEFAULT_SUGGESTION_APPROVED_NOTIFICATION = `
{responder.embed
    title="Suggestion Approved"
    color="green"
    description="Your suggestion (\`{snippet;{suggestion.content};32}\`) has been approved."
    footer="Suggestion {suggestion.id}"
}

{responder.embedField name="Link" value="[Click here]({suggestion.messageLink})"}
`.trim();

export const DEFAULT_SUGGESTION_DENIED_NOTIFICATION = `
{responder.embed
    title="Suggestion Denied"
    color="red"
    description="Your suggestion (\`{snippet;{suggestion.content};32}\`) has been denied."
    footer="Suggestion {suggestion.id}"
}

// Only include the denial reason if it is set
[#if;{suggestion.deniedReason}]
    {responder.embedField name="Reason" value="{suggestion.deniedReason}"}
[/if]
`.trim();

export const DEFAULT_SUGGESTION_TEMPLATE = `
// Check whether anonymous suggestions are enabled
{=anonymous;{settings;suggestions;anonymousSuggestions}}
// If anonymous suggestions are enabled, dont include the author
{=authorName;{#if;{$anonymous};Suggestion {suggestion.id};{user.username;{suggestion.authorId}}}}
// Only include the authors image if anonymous suggestions are disabled
{=authorImage;{#if;{$anonymous};===;false;{user.avatar;{suggestion.authorId}}}}
// If anonymous suggestions are disabled, add the suggestion ID to the footer as it wont be included in the title.
{=footer;{#if;{$anonymous};===;false;Suggestion {suggestion.id}}}

{responder.embed
    author_name="{$authorName}"
    author_image="{$authorImage}"
    color="black"
    description="{suggestion.content}"
    footer="{$footer}"
    timestamp="{suggestion.createdAt}"
}
`.trim();

export const DEFAULT_LEVEL_NOTIFICATION = `
{if;{user.rewards};
    {=rewards;{[]}}
    [#for;{=role};{user.rewards filter=added first=false}]
        {=rewards;{push return;{$rewards};{role.mention allow_mention=false;{$role}}}}
    [/for]
}

Congratulations {user.mention}! You leveled up to level {user.level}{if;{$rewards.0}; and got the {join;{$rewards};, } {if;{$rewards.1};roles;role}}!
`.trim();
