import { pascalToTitle } from './pascal-to-title.js';

const CAMEL_CASE_REGEX = /input(?=[A-Z])/gu; // matches "inputTitle" etc
const STRIP_NUMBERS_REGEX = /\d+/giu; // numbers to completely remove
const REPLACE_CHARACTERS_REGEX = /[^a-z]+/giu; // characters like spaces to replace with underscores

/**
 * Convert a camelCase name to an option name that Discord can use.
 * The output is guaranteed to be lowercase.
 * @example 'userOrRole1' => 'user_or_role'
 */
export function camelCaseToOptionName(parameterName: string, separator = '_') {
  return (
    pascalToTitle(
      parameterName
        // "inputTitle" -> "Title", strip "input" prefixes
        .replaceAll(CAMEL_CASE_REGEX, ''),
    )
      // "user1" => "user"
      // this is especially important with some compilation steps that modify parameter names
      .replaceAll(STRIP_NUMBERS_REGEX, '')
      .trim()
      // "an input" => "an_input"
      .replaceAll(REPLACE_CHARACTERS_REGEX, separator)
      // "example_TTL" => "example_ttl"
      .toLowerCase()
  );
}
