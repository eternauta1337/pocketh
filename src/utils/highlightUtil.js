const chalk = require('chalk');

const highlightUtil = {

  syntax: (text) => {

    const substitutions = {
      'public'     : { matcher: /\bpublic\b/g,     output: chalk`{yellow.bold $&}`    },
      'external'   : { matcher: /\bexternal\b/g,   output: chalk`{yellow.bold $&}`    },
      'private'    : { matcher: /\bprivate\b/g,    output: chalk`{yellow.bold $&}`    },
      'view'       : { matcher: /\bview\b/g,       output: chalk`{yellow.italic $&}`  },
      'pure'       : { matcher: /\bpure\b/g,       output: chalk`{yellow.italic $&}`  },
      'function'   : { matcher: /\bfunction\b/g,   output: chalk`{blue $&}`           },
      'modifier'   : { matcher: /\bmodifier\b/g,   output: chalk`{blue.italic $&}`    },
      'address'    : { matcher: /\baddress\b/g,    output: chalk`{green $&}`          },
      'string'     : { matcher: /\bstring\b/g,     output: chalk`{green $&}`          },
      'mapping'    : { matcher: /\bmapping\b/g,    output: chalk`{magenta $&}`        },
      'struct'     : { matcher: /\bstruct\b/g,     output: chalk`{green.bold $&}`     },
      'constant'   : { matcher: /\bconstant\b/g,   output: chalk`{gray $&}`           },
      'event'      : { matcher: /\bevent\b/g,      output: chalk`{cyan $&}`           },
      'int-uint'   : { matcher: /\bu?int\w*\b/g,   output: chalk`{green $&}`          },
      'enum'       : { matcher: /\benum\b/g,       output: chalk`{green.bold $&}`     },
      'bytes'      : { matcher: /\bbytes\w*\b/g,   output: chalk`{green $&}`          },
      'bool'       : { matcher: /\bbool\b/g,       output: chalk`{green $&}`          },
      '[]'         : { matcher: /\[\]/g,           output: chalk`{red $&}`            },
      '{...}'      : { matcher: /\{\.\.\.\}/g,     output: chalk`{gray $&}`           },
      'internal'   : { matcher: /\binternal\b/g,   output: chalk`{yellow $&}`         },
    };

    // Apply all substitutions.
    Object.keys(substitutions).map(key => {
      const substitution = substitutions[key];
      text = text.replace(substitution.matcher, substitution.output);
    });

    return text;
  }
};

module.exports = highlightUtil;
