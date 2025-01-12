/**
 * klassenbuch.js
 * autor: Matthias Groß
 * version: 1.22.2
 */

// console.log(LessonDocs);
// console.log(LessonDocs.classesOrGroups);
// console.log(LessonDocs.subjects);
// console.log(BaseData.requestVerificationToken);
// console.log(BaseData.hasChanges);
// console.log(BaseData.url);
// // console.log(BaseData.checkUI(false));
// console.log(BaseData.getHeaders);
// console.log(LessonDocs.weeks);

// LessonDocs.getH = () => {
// 	return this.getHeaders();
// }

// console.log(LessonDocs.getH());

/**
 * drawdown.js
 * (c) Adam Leggett
 */

//************* https://github.com/adamvleggett/drawdown/blob/master/drawdown.js ************************
//************* Thanks to Adam Leggett ******************************************************************
function markdown(src) {
  var rx_lt = /</g;
  var rx_gt = />/g;
  var rx_space = /\t|\r|\uf8ff/g;
  var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g;
  var rx_hr = /^([*\-=_] *){3,}$/gm;
  var rx_blockquote = /\n *&gt; *([^]*?)(?=(\n|$){2})/g;
  var rx_list =
    /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g;
  var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g;
  var rx_highlight =
    /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g;
  var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g;
  var rx_link = /((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g;
  var rx_table = /\n(( *\|.*?\| *\n)+)/g;
  var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/;
  var rx_row = /.*\n/g;
  var rx_cell = /\||(.*?[^\\])\|/g;
  var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g;
  var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g;
  var rx_stash = /-\d+\uf8ff/g;

  function replace(rex, fn) {
    src = src.replace(rex, fn);
  }

  function element(tag, content) {
    return '<' + tag + '>' + content + '</' + tag + '>';
  }

  function blockquote(src) {
    return src.replace(rx_blockquote, function (all, content) {
      return element(
        'blockquote',
        blockquote(highlight(content.replace(/^ *&gt; */gm, '')))
      );
    });
  }

  function list(src) {
    return src.replace(rx_list, function (all, ind, ol, num, low, content) {
      var entry = element(
        'li',
        highlight(
          content
            .split(
              RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')
            )
            .map(list)
            .join('</li><li>')
        )
      );

      return (
        '\n' +
        (ol
          ? '<ol start="' +
            (num
              ? ol + '">'
              : parseInt(ol, 36) -
                9 +
                '" style="list-style-type:' +
                (low ? 'low' : 'upp') +
                'er-alpha">') +
            entry +
            '</ol>'
          : element('ul', entry))
      );
    });
  }

  function highlight(src) {
    return src.replace(
      rx_highlight,
      function (all, _, p1, emp, sub, sup, small, big, p2, content) {
        return (
          _ +
          element(
            emp
              ? p2
                ? 'strong'
                : 'em'
              : sub
              ? p2
                ? 's'
                : 'sub'
              : sup
              ? 'sup'
              : small
              ? 'small'
              : big
              ? 'big'
              : 'code',
            highlight(content)
          )
        );
      }
    );
  }

  function unesc(str) {
    return str.replace(rx_escape, '$1');
  }

  var stash = [];
  var si = 0;

  src = '\n' + src + '\n';

  replace(rx_lt, '&lt;');
  replace(rx_gt, '&gt;');
  replace(rx_space, '  ');

  // blockquote
  src = blockquote(src);

  // horizontal rule
  replace(rx_hr, '<hr/>');

  // list
  src = list(src);
  replace(rx_listjoin, '');

  // code
  replace(rx_code, function (all, p1, p2, p3, p4) {
    stash[--si] = element(
      'pre',
      element('code', p3 || p4.replace(/^    /gm, ''))
    );
    return si + '\uf8ff';
  });

  // link or image
  replace(rx_link, function (all, p1, p2, p3, p4, p5, p6) {
    stash[--si] = p4
      ? p2
        ? '<img src="' + p4 + '" alt="' + p3 + '"/>'
        : '<a href="' + p4 + '">' + unesc(highlight(p3)) + '</a>'
      : p6;
    return si + '\uf8ff';
  });

  // table
  replace(rx_table, function (all, table) {
    var sep = table.match(rx_thead)[1];
    return (
      '\n' +
      element(
        'table',
        table.replace(rx_row, function (row, ri) {
          return row == sep
            ? ''
            : element(
                'tr',
                row.replace(rx_cell, function (all, cell, ci) {
                  return ci
                    ? element(
                        sep && !ri ? 'th' : 'td',
                        unesc(highlight(cell || ''))
                      )
                    : '';
                })
              );
        })
      )
    );
  });

  // heading
  replace(rx_heading, function (all, _, p1, p2) {
    return _ + element('h' + p1.length, unesc(highlight(p2)));
  });

  // paragraph
  replace(rx_para, function (all, content) {
    return element('p', unesc(highlight(content)));
  });

  // stash
  replace(rx_stash, function (all) {
    return stash[parseInt(all)];
  });

  return src.trim();
}
//*******************************************************************************************************

/**
 * klassenbuch.js
 * autor: Matthias Groß
 * version: 1.22.2
 */

//------------------------------------------------------------------------
const rotaryWeeks = [
  [],
  //[],[],[],[],//[],[],[],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-IK22-2',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [], //Herbstferien
  [], //Herbstferien
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [], //Feiertag + FT
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [],
  [], //Weihnachtsferien
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [], //Winterferien
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [],
  [], //Osterferien
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI22-1',
    'H-FI22-2',
    'H-IK22',
    'H-TK22',
    'H-Sa22',
    'H-HW22',
    'H-HM22',
    'H-Ti22',
    'H-KE22',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [],
  [
    'H-FI23-1',
    'H-FI23-2',
    'H-IK23',
    'H-TK23',
    'H-Sa23',
    'H-HW23',
    'H-HM23',
    'H-Ti23',
    'H-KE23',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
  [
    'H-FI24-1',
    'H-FI24-2',
    'H-IK24',
    'H-TK24',
    'H-Sa24',
    'H-HW24',
    'H-HM24',
    'H-Ti24',
    'H-KE24',
    'H-AG',
    'H-BFS',
    'H-BVJ',
  ],
];
// const rotaryWeeks = [
// 	// [],[],[],[],[],[],[],[],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	[],[],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],

// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	[],[],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],

// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	[],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],

// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	[],[],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],

// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI21-1', 'H-FI21-2', 'H-IK21', 'H-TK21', 'H-Sa21', 'H-HW21', 'H-HM21', 'H-Ti21', 'H-KE21', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI22-1', 'H-FI22-2', 'H-IK22', 'H-TK22', 'H-Sa22', 'H-HW22', 'H-HM22', 'H-Ti22', 'H-KE22', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	['H-FI23-1', 'H-FI23-2', 'H-IK23', 'H-TK23', 'H-Sa23', 'H-HW23', 'H-HM23', 'H-Ti23', 'H-KE23', 'H-AG', 'H-BFS', 'H-BVJ'],
// 	[],[]
// ];

// console.log(rotaryWeeks);

const selViewClassOrGroup = document.querySelector('#selViewClassOrGroup');
const btnWeekNext = document.querySelector('#btnWeekNext');
const btnWeekBack = document.querySelector('#btnWeekBack');
const btnWeekStart = document.querySelector('#btnWeekStart');
// const btnSave = document.querySelector('#btnSave');
const btnGroup = document.querySelectorAll('.btn-group');
const loading = document.querySelector('.loading');
const btnLSave = document.querySelector('#btnLSave');
const btnLDelete = document.querySelector('#btnLDelete');

const navTop = document.querySelector('#navTop');
const planNavigation = document.querySelector('.row.mb-2');
navTop.appendChild(planNavigation);

btnWeekNext.setAttribute('accesskey', 'n');
btnWeekBack.setAttribute('accesskey', 'z');

btnWeekNext.classList.add('noprint');
btnWeekBack.classList.add('noprint');
btnWeekStart.classList.add('noprint');
btnGroup[1].classList.add('noprint');

selViewClassOrGroup.style.width = '15em';

// btnSave.setAttribute('title', 'Ctrl + s');
btnLSave.setAttribute('title', 'Ctrl + s');
btnLDelete.setAttribute('title', 'Ctrl + d');

//------ verschiebe NEXT-Button in die Gruppe ZURÜCK/AKTUELL -------------
// const buttonNext = document.querySelector('#btnWeekNext');
// const btnGroup1 = document.querySelector('#btnWeekBack').parentElement;
const btnGroup1 = btnWeekBack.parentElement;
// buttonNext.parentElement.removeChild(buttonNext);
// btnWeekNext.parentElement.removeChild(btnWeekNext);

// btnGroup1.appendChild(btnWeekNext);
btnGroup1.insertBefore(btnWeekNext, btnWeekStart);
// btnGroup1.insertBefore(btnWeekNext, btnGroup1.children[1]);
// console.log(btnGroup1);
//------------------------------------------------------------------------

const btnVertretungsPlan = document.createElement('a');
btnVertretungsPlan.setAttribute('id', 'vertretungsPlan');
btnVertretungsPlan.setAttribute('type', 'button');
btnVertretungsPlan.setAttribute('href', 'https://www.sbsz-hsp.de/sdb/getPlan/');
// btnVertretungsPlan.setAttribute('target', 'vertretungsPlan');
btnVertretungsPlan.setAttribute('target', 'vertretungsplan');

btnVertretungsPlan.classList.add('btn', 'btn-outline-primary', 'noprint');
btnVertretungsPlan.innerHTML =
  '<span class="d-none d-sm-inline-block">Vertretungplan</span>';
btnGroup1.appendChild(btnVertretungsPlan);

// btnVertretungsPlan.addEventListener('click', event => {
// 	spnWeek = document.querySelector('#spnWeek');
// 	date = spnWeek.textContent.split('.').reverse().join('-');
// 	localStorage.setItem('datum', date);
// 	console.log(date);
// 	// btnVertretungsPlan.setAttribute('href', 'https://www.sbsz-hsp.de/sdb/getPlan/')
// });

// --eingefügt am 25.10.2024 um zu verhindern, dass die Einfärbungen verschwinden--
btnLSave.addEventListener('click', (event) => {
  console.log('btnSave click');
  checkOnlyMyLessons();
});
// --------------------------------------------------------------------------------

//-------Einbinden der Tasten 'Arrow-left' und 'Arrow-right' -------------
document.addEventListener('keydown', (event) => {
  if (
    mdEditor.style.display !== 'block' &&
    event.ctrlKey &&
    event.key === 's'
  ) {
    // Prevent the Save dialog to open
    event.preventDefault();
    btnSave.click();
  } else if (
    mdEditor.style.display === 'block' &&
    event.ctrlKey &&
    event.key === 's'
  ) {
    // Prevent the Save dialog to open
    event.preventDefault();
    document.querySelector('#btnLSave').click();
  } else if (
    mdEditor.style.display !== 'block' &&
    event.ctrlKey &&
    event.code === 'ArrowDown'
  ) {
    // Prevent the Save dialog to open
    event.preventDefault();
    btnWeekStart.click();
  } else if (
    mdEditor.style.display === 'block' &&
    event.ctrlKey &&
    event.key === 'd'
  ) {
    event.preventDefault();
    document.querySelector('#btnLDelete').click();
  }

  if (
    mdEditor.style.display !==
    'block' /*&& selSubjects.id !== document.activeElement.id*/
  ) {
    switch (event.code) {
      case 'ArrowLeft':
        // console.log('arrow left');
        if (event.ctrlKey) {
          event.stopImmediatePropagation();
          gotoPrevRotaryWeek(LessonDocs.currentWeek);
          // console.log(LessonDocs.currentWeek);
        } else {
          btnWeekBack.click();
        }
        break;

      case 'ArrowRight':
        // console.log('arrow right');
        if (event.ctrlKey) {
          event.stopImmediatePropagation();
          gotoNextRotaryWeek(LessonDocs.currentWeek);
        } else {
          btnWeekNext.click();
        }
        break;
    }

    if (event.altKey && event.key === 'A') {
      // console.log(event.key);
      selSubjects.blur();
    }
  }
});

selViewClassOrGroup.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowLeft' || event.code === 'ArrowRight')
    event.preventDefault();
});

tblWeek.addEventListener(
  'click',
  (event) => {
    let target = event.target;
    if (
      event.ctrlKey &&
      (target.classList.contains('lesson-head') ||
        target.parentElement.classList.contains('lesson-head'))
    ) {
      event.stopImmediatePropagation();
      // event.preventDefault();
      if (event.target.nodeName == 'DIV') {
        let c = event.target.querySelector('.l').textContent.split(',');
        // console.log(c);
        if (c.length == 1) {
          for (let i = 0; i < selViewClassOrGroup.options.length; ++i) {
            if (
              selViewClassOrGroup.options[i].value
                .toLowerCase()
                .includes(c[0].toLowerCase())
            ) {
              // console.log(selViewClassOrGroup.options[i].value);
              selViewClassOrGroup.value = selViewClassOrGroup.options[i].value;
              break;
            }
          }
          // selViewClassOrGroup.value = c;
        } else {
          for (let i = 0; i < selViewClassOrGroup.options.length; ++i) {
            if (
              selViewClassOrGroup.options[i].value
                .toLowerCase()
                .includes(c[0].toLowerCase())
            ) {
              // console.log(selViewClassOrGroup.options[i].value);
              selViewClassOrGroup.value = selViewClassOrGroup.options[i].value;
              break;
            }
          }
          // selViewClassOrGroup.value = c[0].trim();
        }
      } else if (event.target.parentElement.nodeName == 'DIV') {
        let c = event.target.parentElement
          .querySelector('.l')
          .textContent.split(',');
        // console.log(c);
        if (c.length == 1) {
          for (let i = 0; i < selViewClassOrGroup.options.length; ++i) {
            if (
              selViewClassOrGroup.options[i].value
                .toLowerCase()
                .includes(c[0].toLowerCase())
            ) {
              // console.log(selViewClassOrGroup.options[i].value);
              selViewClassOrGroup.value = selViewClassOrGroup.options[i].value;
              break;
            }
          }
          // selViewClassOrGroup.value = c;
        } else {
          for (let i = 0; i < selViewClassOrGroup.options.length; ++i) {
            if (
              selViewClassOrGroup.options[i].value
                .toLowerCase()
                .includes(c[0].toLowerCase())
            ) {
              // console.log(selViewClassOrGroup.options[i].value);
              selViewClassOrGroup.value = selViewClassOrGroup.options[i].value;
              break;
            }
          }
          // selViewClassOrGroup.value = c[0].trim();
        }
        // if(c.length == 1){
        //   selViewClassOrGroup.value = c;
        // }else{
        // 	selViewClassOrGroup.value = c[0].trim();
        // }
      }
      selViewClassOrGroup.dispatchEvent(new Event('change'));
      if (event.shiftKey && !chkColoringSubjects.checked) {
        chkColoringSubjects.click();
      }
      selViewClassOrGroup.focus();
      // console.log(event.target.querySelector('.l').textContent);
    }
    // console.log(event.target);
  },
  (capture = true)
);

//------------------------------------------------------------------------

function showOnlyMyLessons(yes) {
  const lessons = document.querySelectorAll('.lesson .ct');
  if (yes) {
    lessons.forEach((lesson) => {
      lesson.parentElement.parentElement.classList.add('hidden-element');
    });
  } else {
    lessons.forEach((lesson) => {
      lesson.parentElement.parentElement.classList.remove('hidden-element');
    });
  }

  // coloringClasses(chkColoringClasses.checked);
}

function runFunctions() {
  showOnlyMyLessons(chkMyLessons.checked);
  coloringClasses(chkColoringClasses.checked);
  coloringSubjects(chkColoringSubjects.checked);
  getSubjects();
  showOnlySelectedSubject(selSubjects.value);
}

function gotoRotaryWeekForSelectedClass(weekNumber, className) {
  // let i = weekNumber;
  // if(!rotaryWeeks[weekNumber].includes(className)) {
  // 	for(; i > 0; i--) {
  // 		if(rotaryWeeks[i-1]?.includes(className)){
  //   		break;
  // 		}
  // 	}
  // 	if(i==0){
  // 		return;
  // 	}
  // 	LessonDocs.currentWeek = i;
  // 	btnWeekBack.click();
  // }
  // if(!chkMyLessons.checked) {
  // 	chkMyLessons.click();
  // }
  // console.log('gotoRotaryWeekForSelectedClass');
  // // runFunctions();
}

function changeClassList() {
  let ulClassesOrGroups_li = mdEditor.querySelectorAll('#ulClassesOrGroups li');

  ulClassesOrGroups_li.forEach((li) => {
    li.style.display = 'none';
  });

  ulClassesOrGroups_li.forEach((li) => {
    // console.log(li.textContent);
    rotaryWeeks[LessonDocs.currentWeek].forEach((entry) => {
      let re = new RegExp(`^${entry}`, 'i');
      if (li.textContent.search(re) >= 0) {
        li.style.display = 'inline';
      }
    });
  });
}

function gsapAnimation() {
  gsap.fromTo('.lesson-head', { top: -25 }, { top: 0, duration: '0.6' });
  gsap.fromTo(
    '.lesson-head:not(.plan)',
    { opacity: '0' },
    { opacity: '1', duration: '0.6' }
  );
  gsap.fromTo('.lesson-body', { y: '25' }, { y: '0', duration: '0.6' });
  gsap.fromTo(
    '.lesson-body:not(.plan)',
    { opacity: '0' },
    { opacity: '1', duration: '0.6' }
  );
  // gsap.fromTo(".ul-missing-pupils ul", {height: 0}, {height: 1, duration: 5});
}

function initGSAPHoverEvent() {
  const lessonHeadsPlan = tblWeek.querySelectorAll('.lesson-head.plan');

  lessonHeadsPlan.forEach((element) => {
    element.addEventListener('mouseover', (e) => {
      let targ = e.target;
      while (!targ.classList.contains('.lesson-head')) {
        targ = targ.parentElement;
      }
      gsap.to(targ, { opacity: 1, backgroundColor: 'white', duration: 1 });
      console.log(targ);
    });
    element.addEventListener('mouseleave', (e) => {
      let targ = e.target;
      while (!targ.classList.contains('.lesson-head')) {
        targ = targ.parentElement;
      }
      gsap.to(targ, { opacity: 0.3, duration: 1 });
      console.log(targ);
    });
  });
}

function checkOnlyMyLessons(e) {
  const tblWeek = document.querySelector('#tblWeek');
  const observer2 = new MutationObserver(() => {
    runFunctions();
    getLessonData();
    gsapAnimation();
    // initGSAPHoverEvent();
    observer2.disconnect();
  });

  observer2.observe(tblWeek, { subtree: true, childList: true });
}

const divChkBoxes = document.createElement('div');
divChkBoxes.setAttribute('id', 'divChkBoxes');
divChkBoxes.classList.add('noprint');

const divColorBox = document.createElement('div');
divColorBox.setAttribute('id', 'divColorBox');

const divClassBox = document.createElement('div');
divClassBox.setAttribute('id', 'divClassBox');

const divSubjectBox = document.createElement('div');
divSubjectBox.setAttribute('id', 'divSubjectBox');

const chkMyLessons = document.createElement('input');
chkMyLessons.setAttribute('type', 'checkbox');
chkMyLessons.setAttribute('id', 'chkMyLessons');
chkMyLessons.setAttribute(
  'title',
  'zeigt nur die eigenen Stunden an (bei Klassenauswahl)'
);

const lblMyLessons = document.createElement('label');
lblMyLessons.setAttribute('id', 'lblMyLessons');
lblMyLessons.setAttribute('for', 'chkMyLessons');
lblMyLessons.setAttribute('accesskey', 'l');
lblMyLessons.innerHTML = 'just my <u>l</u>essons';
lblMyLessons.setAttribute(
  'title',
  'zeigt nur die eigenen Stunden an (wenn Klasse ausgewählt)'
);

// btnGroup[1].appendChild(chkMyLessons);
// btnGroup[1].appendChild(lblMyLessons);
divClassBox.appendChild(chkMyLessons);
divClassBox.appendChild(lblMyLessons);

const chkColoringClasses = document.createElement('input');
chkColoringClasses.setAttribute('type', 'checkbox');
chkColoringClasses.setAttribute('id', 'chkColoringClasses');

const lblColoringClasses = document.createElement('label');
lblColoringClasses.setAttribute('id', 'lblColoringClasses');
lblColoringClasses.setAttribute('for', 'chkColoringClasses');
lblColoringClasses.setAttribute('accesskey', 'c');
lblColoringClasses.setAttribute(
  'title',
  'färbt die Klassen unterschiedlich ein'
);
lblColoringClasses.innerHTML = 'coloring <u>c</u>lasses';

const chkColoringSubjects = document.createElement('input');
chkColoringSubjects.setAttribute('type', 'checkbox');
chkColoringSubjects.setAttribute('id', 'chkColoringSubjects');

const lblColoringSubjects = document.createElement('label');
lblColoringSubjects.setAttribute('id', 'lblColoringSubjects');
lblColoringSubjects.setAttribute('for', 'chkColoringSubjects');
lblColoringSubjects.setAttribute('accesskey', 's');
lblColoringSubjects.setAttribute(
  'title',
  'färbt die Fächer/Lernfelder unterschiedlich ein'
);
lblColoringSubjects.innerHTML = 'coloring <u>s</u>ubjects';

const selSubjects = document.createElement('select');
selSubjects.setAttribute('id', 'selSubjects');
const optGrpSubjects = document.createElement('optgroup');
optGrpSubjects.setAttribute('id', 'optGrpSubjects');
optGrpSubjects.label = 'Subjects';
const optSubjects = document.createElement('option');
optSubjects.innerText = 'All';
selSubjects.appendChild(optSubjects);
selSubjects.appendChild(optGrpSubjects);

selSubjects.setAttribute('title', 'Fach-/Lernfeldauswahl');
selSubjects.setAttribute('accesskey', 'a');
selSubjects.addEventListener('keydown', (event) => {
  // console.log(event.key);
  if (event.code === 'ArrowLeft' || event.code === 'ArrowRight')
    event.preventDefault();
});

const divPlanBox = document.createElement('div');
divPlanBox.setAttribute('id', 'divPlanBox');

const chkShowPlanLassons = document.createElement('input');
chkShowPlanLassons.setAttribute('type', 'checkbox');
chkShowPlanLassons.setAttribute('id', 'chkShowPlanLassons');

const lblShowPlanLassons = document.createElement('label');
lblShowPlanLassons.setAttribute('id', 'lblShowPlanLassons');
lblShowPlanLassons.setAttribute('for', 'chkShowPlanLassons');
// lblShowPlanLassons.setAttribute('accesskey', 'p');
// lblShowPlanLassons.innerHTML = 'show <u>p</u>lan lessons';
lblShowPlanLassons.setAttribute('accesskey', 'v');
lblShowPlanLassons.setAttribute(
  'title',
  'blendet die geplanten Stunden ein (soweit vom Stundenplan übernommen)'
);
lblShowPlanLassons.innerHTML = '<u>v</u>iew scheduled lessons';

divPlanBox.appendChild(chkShowPlanLassons);
divPlanBox.appendChild(lblShowPlanLassons);

// btnGroup[1].appendChild(chkColoringClasses);
// btnGroup[1].appendChild(lblColoringClasses);
divColorBox.appendChild(chkColoringClasses);
divColorBox.appendChild(lblColoringClasses);

divSubjectBox.appendChild(chkColoringSubjects);
divSubjectBox.appendChild(lblColoringSubjects);

divChkBoxes.appendChild(divClassBox);
divChkBoxes.appendChild(divColorBox);
divChkBoxes.appendChild(divSubjectBox);
divChkBoxes.appendChild(selSubjects);
divChkBoxes.appendChild(divPlanBox);

selViewClassOrGroup.parentElement.appendChild(divChkBoxes);

// btnGroup[1].appendChild(divChkBoxes);

chkColoringSubjects.addEventListener('click', () => {
  if (chkColoringSubjects.checked && chkColoringClasses.checked) {
    chkColoringClasses.click();
  }

  runFunctions();
});

chkColoringClasses.addEventListener('click', () => {
  if (chkColoringClasses.checked && chkColoringSubjects.checked) {
    chkColoringSubjects.click();
  }

  runFunctions();
});

chkMyLessons.addEventListener('click', () => {
  // showOnlyMyLessons(chkMyLessons.checked);
  runFunctions();
});

function isPupilPresent(data, pupil_name, li) {
  let d = new Date(2024, 9, 23);
  d = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${d.getDate()}`;
  console.log(d, li);
  // console.log(pupil_name, data);
  data.m.forEach((entry) => {
    if (entry.d.includes(d)) {
      console.log('test', pupil_name, entry);
      // li.innerText = li.innerText + ' anwesend';
    }
    li.classList.add('is-present');
  });
}

function getPupilMissings(pupil_id, pupil_name, li) {
  fetch(
    `https://mein.cevex.de/SBSZHSP/Editor/GetMissingDetailData?pupilGuid=${pupil_id}`
  )
    .then((response) => response.json())
    .then((data) => isPupilPresent(data, pupil_name, li));
  // .then(data => console.log(data));
}

function showMissingPupils(data, lesson_id, cl, idx) {
  // console.log(data[0].g);

  const mpu_container = document.querySelector(`#l-${lesson_id}-${cl}-${idx}`);
  if (mpu_container !== null) mpu.parentElement.removeChild(mpu);

  const divMissingPupils = document.createElement('div');
  // weitergabe aller events auf divMissingPupils stoppen
  divMissingPupils.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
  });
  // divMissingPupils.innerHTML = `<strong>es fehlten (${cl}):</strong>`;
  divMissingPupils.classList.add('missing-pupils');
  divMissingPupils.classList.add('noprint');
  divMissingPupils.setAttribute('id', `l-${lesson_id}-${cl}-${idx}`);
  const ulMissingPupils = document.createElement('ul');
  ulMissingPupils.classList.add('ul-missing-pupils');
  divMissingPupils.appendChild(ulMissingPupils);
  gsap.fromTo(
    divMissingPupils,
    { height: 0, opacity: 0, marginTop: 0 },
    {
      height: 'auto',
      opacity: 1,
      marginTop: '0.75em',
      duration: 0.5,
      delay: 0.3,
    }
  );

  let pupilName = null;
  data.forEach((element) => {
    if (element.missingToday == true && element.missings !== null) {
      // console.log(element.g, element.d);
      // console.log(element);
      pupilName = element.d.replace(/ *\(.*\) */g, '').trim();
      const li = document.createElement('li');
      li.classList.add('unclear');
      li.innerText = pupilName;
      // console.log(li);
      if (element.missings !== null) {
        // console.log(element.missings.t);
        switch (element.missings.t) {
          case 0:
            li.classList.remove('unclear');
            li.classList.add('excused');
            break;
          case 1:
            li.classList.remove('unclear');
            li.classList.add('unexcused');
            break;
          // case 2:
          // 	li.classList.add('unclear');
          // 	break;
          case 3:
            li.classList.remove('unclear');
            li.classList.add('message');
            break;
        }
      }
      ulMissingPupils.appendChild(li);
      // 	getPupilMissings(element.g, pupilName, li);
      // console.log(li);
    }
  });
  // if(ulMissingPupils.hasChildNodes()) {
  let countPupils = ulMissingPupils.childElementCount;
  let txt = `<strong>Abwesende <span class="class-name">(${cl}): (${countPupils})</span></strong>`;
  divMissingPupils.innerHTML = txt + divMissingPupils.innerHTML;
  document
    .querySelector(`#l-${lesson_id} .lesson-body`)
    .appendChild(divMissingPupils);
  // }
}

function getMissingPupils(d, c, s, l, lesson_id) {
  d = d.split('T')[0];

  let pupilsData = {};

  c.forEach((cl, index) => {
    // console.log(`https://mein.cevex.de${LessonDocs.url.getLessonDocPupilData}?d=${d}&l=${l}&s=${s}&c=${cl}&m=true`);
    fetch(
      `https://mein.cevex.de${LessonDocs.url.getLessonDocPupilData}?d=${d}&l=${l}&s=${s}&c=${cl}&m=true`
    )
      .then((response) => response.json())
      .then((data) => showMissingPupils(data, lesson_id, cl, index));
  });
}

function showLessonData(data) {
  let lessons = null;
  // let li = '<li>{{line}}</li>';
  data.week.forEach((day) => {
    // console.log(d);
    if (day.l !== null) {
      day.l.forEach((h) => {
        const l_id = h.g;
        const lesson_body = document.querySelector(`#l-${l_id} .lesson-body`);
        lesson_body.innerHTML = markdown(h.t);

        if (h.isc) {
          if (!h.ct.trim() && h.m.trim().length > 0) {
            //!h.ct.trim() -> nur die eigenen Bemerkungen anzeigen
            // console.log(h);

            // const prev_ul =  document.querySelector(`#l-${l_id} .lesson-details`);

            const lesson_details = document.querySelector(
              `#l-${l_id} .lesson-body .lesson-details`
            );

            if (lesson_details !== null) {
              document
                .querySelector(`#l-${l_id} .lesson-body`)
                .removeChild(lesson_details);
            }

            div_lesson_details = document.createElement('div');
            div_lesson_details.classList.add('lesson-details');

            const e = markdown(h.m);
            div_lesson_details.innerHTML += e;
            lesson_body.appendChild(div_lesson_details);
          }

          if (h.et == 6 || h.et == 7 || h.et == 8) {
            const lesson_icon = document.querySelector(
              `#l-${h.g} .lesson-head .icn1`
            );

            switch (h.et) {
              case 8:
                lesson_icon.classList.remove('fa-check');
                lesson_icon.classList.add('fa-book-open-reader');

              case 7:
                lesson_icon.classList.remove('fa-check');
                lesson_icon.classList.add('fa-user-graduate');
            }
            if (!h.ct.trim()) {
              //!h.ct.trim() -> Abwesende nur aus eigenen Stunden anzeigen
              getMissingPupils(h.d, h.c, h.s, h.l, h.g);
            }
          }
        }
      });
    }
  });
}

function getLessonData() {
  let c = selViewClassOrGroup.value;
  let d = document
    .querySelector('#spnWeek')
    .innerText.split('.')
    .reverse()
    .join('-');
  fetch(
    `https://mein.cevex.de${LessonDocs.url.getLessonDocData}?d=${d}&vcog=${c}`
  )
    .then((response) => response.json())
    .then((data) => showLessonData(data));
}

chkShowPlanLassons.addEventListener('click', () => {
  let root = document.querySelector(':root');

  if (chkShowPlanLassons.checked) {
    root.style.setProperty('--display-plan', 'block');
  } else {
    root.style.setProperty('--display-plan', 'none');
  }
});

// let selViewClassOrGroupClicked = false;

selViewClassOrGroup.addEventListener('change', () => {
  checkOnlyMyLessons();
});

selViewClassOrGroup.addEventListener('click', () => {
  // selViewClassOrGroupClicked = true;
});

btnWeekStart.addEventListener('click', () => {
  checkOnlyMyLessons();
});

function gotoPrevRotaryWeek(weekNumber) {
  // console.log(weekNumber);
  let classesOnWeek = rotaryWeeks[weekNumber];
  // console.log(classesOnWeek[0]);
  let i = weekNumber;
  for (; i > 0; i--) {
    if (rotaryWeeks[i - 1]?.includes(classesOnWeek[0])) {
      break;
    }
  }

  // console.log(i);

  if (i == 0) {
    return;
  }

  LessonDocs.currentWeek = i;
  // console.log(LessonDocs.currentWeek);
  btnWeekBack.click();
}

btnWeekBack.addEventListener('click', (e) => {
  checkOnlyMyLessons();
  if (e.ctrlKey) {
    e.stopImmediatePropagation();
    // console.log(LessonDocs.currentWeek);
    gotoPrevRotaryWeek(LessonDocs.currentWeek);
  }
});

function gotoNextRotaryWeek(weekNumber) {
  // console.log(weekNumber);
  let classesOnWeek = rotaryWeeks[weekNumber];
  // console.log(classesOnWeek[0]);
  let i = weekNumber;
  for (; i < rotaryWeeks.length; i++) {
    if (rotaryWeeks[i + 1]?.includes(classesOnWeek[0])) {
      break;
    }
  }

  if (i == rotaryWeeks.length) {
    return;
  }

  LessonDocs.currentWeek = i;
  // console.log(LessonDocs.currentWeek);
  btnWeekNext.click();
}

btnWeekNext.addEventListener('click', (e) => {
  checkOnlyMyLessons();
  if (e.ctrlKey) {
    e.stopImmediatePropagation();
    gotoNextRotaryWeek(LessonDocs.currentWeek);
  }
});

selSubjects.addEventListener('change', () => {
  showOnlySelectedSubject(selSubjects.value);
});

//--- Überwachen des Atributs 'class' des Elemetes 'mdEditor'
let reload = false;

// let btnLSave = document.querySelector('#btnLSave');
btnLSave.addEventListener('click', () => {
  reload = true;
});

let clickCount = 0;

// let btnLDelete = document.querySelector('#btnLDelete');
btnLDelete.addEventListener('click', () => {
  ++clickCount;
  if (clickCount === 2) {
    clickCount = 0;
    reload = true;
  }
});

let mdEditor = document.querySelector('#mdEditor');

let prevClassState = mdEditor.classList.contains('show');
// console.log(prevClassState);
let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName == 'class') {
      // console.log('mutation');
      let currentClassState = mutation.target.classList.contains('show');
      // console.log(currentClassState);
      if (prevClassState !== currentClassState)
        prevClassState = currentClassState;
      if (!currentClassState)
        // checkOnlyMyLessons();
        setTimeout(() => {
          // showOnlyMyLessons(chkMyLessons.checked);
          runFunctions();
          if (reload) {
            getLessonData();
            reload = false;
          }
        }, 100);
    }
  });
});

observer.observe(mdEditor, { attributes: true });

//------------------------------------------------------------------------

function coloringClasses(coloring) {
  // console.log('coloring classes');
  let lessons = document.querySelectorAll('.lesson .l');

  let classes = new Set();

  lessons.forEach((lesson) => {
    if (
      !lesson.parentElement.parentElement.classList.contains(
        'hidden-element'
      ) /*&& !lesson.parentElement.classList.contains('plan')*/
    ) {
      classes.add(lesson.innerText);
    }
    // lesson.parentElement.classList.remove('grp'+ 1);
  });

  lessons.forEach((lesson) => {
    for (let i = 0; i < 8; ++i)
      lesson.parentElement.classList.remove('grp' + i);
  });

  classes = Array.from(classes).sort();
  // console.log(classes);

  if (coloring /*&& classes.length > 1*/) {
    lessons.forEach((lesson) => {
      // console.log(Array.from(classes));
      for (let i = 0; i < classes.length; ++i) {
        if (lesson.innerText === classes[i]) {
          lesson.parentElement.classList.add('grp' + i);
          // console.log(lesson.innerText);
        }
      }
    });
  }
}

function coloringSubjects(coloring) {
  // console.log('coloring subjects');
  let lessons = document.querySelectorAll('.lesson .r');

  let subjects = new Set();

  lessons.forEach((lesson) => {
    if (
      !lesson.parentElement.parentElement.classList.contains(
        'hidden-element'
      ) /*&& !lesson.parentElement.classList.contains('plan')*/
    ) {
      subjects.add(lesson.innerText.split(' ')[0]);
    }
    // lesson.parentElement.classList.remove('grp'+ 1);
  });

  lessons.forEach((lesson) => {
    for (let i = 0; i < 8; ++i)
      lesson.parentElement.classList.remove('grpCS' + i);
  });

  subjects = Array.from(subjects).sort();
  // console.log(subjects);

  if (coloring /*&& classes.length > 1*/) {
    lessons.forEach((lesson) => {
      // console.log(Array.from(classes));
      for (let i = 0; i < subjects.length; ++i) {
        if (lesson.innerText.split(' ')[0] === subjects[i]) {
          lesson.parentElement.classList.add('grpCS' + i);
          // console.log(lesson.innerText);
        }
      }
    });
  }
}

function getSubjects() {
  const prevSubject = selSubjects.value;
  let lessons = document.querySelectorAll('.lesson .r');

  let subjects = new Set();

  while (optGrpSubjects.hasChildNodes()) {
    optGrpSubjects.removeChild(optGrpSubjects.firstChild);
  }

  lessons.forEach((lesson) => {
    if (
      !lesson.parentElement.parentElement.classList.contains(
        'hidden-element'
      ) /*&& !lesson.parentElement.classList.contains('plan')*/
    ) {
      l = lesson.innerText.split(' ')[0].trim();

      subjects.add(l);
    }
  });

  subjects = Array.from(subjects).sort();

  subjects.forEach((subject) => {
    let optSubject = document.createElement('option');
    optSubject.innerText = subject;
    optGrpSubjects.appendChild(optSubject);
    if (subject === prevSubject) {
      selSubjects.value = subject;
    }
  });
}

function showOnlySelectedSubject(subject) {
  let lessons = document.querySelectorAll('.lesson .r');

  lessons.forEach((lesson) => {
    l = lesson.innerText.split(' ')[0].trim();

    if (l !== subject && subject !== 'All') {
      lesson.parentElement.parentElement.classList.add('hidden-subject');
    } else {
      lesson.parentElement.parentElement.classList.remove('hidden-subject');
    }
  });
}

const ulMissingPupils = mdEditor.querySelector('#ulMissingPupils');
// console.log(ulMissingPupils);

ulMissingPupils.addEventListener('click', (event) => {
  // console.log(event.target.parentElement);
  if (event.target.tagName === 'SPAN') {
    let missingPupil = event.target.textContent.split(' (');
    if (missingPupil.length > 1) {
      missingPupil[1] = missingPupil[1].trim().slice(0, -1);
    }
    let missingPupilName = missingPupil[0].trim();
    let missingPupilClass = missingPupil[1]; //?.trim().slice(0,-1);
    console.log(missingPupilName, missingPupilClass, missingPupil.length);

    if (missingPupilClass) {
      sessionStorage.setItem('missingPupil', JSON.stringify(missingPupil));
      sessionStorage.setItem('classOrGroup', missingPupilClass);
      location.href = 'https://mein.cevex.de/SBSZHSP/Editor/Missings';
      // open("https://mein.cevex.de/SBSZHSP/Editor/Missings","_blank");
    }
  }
});

chkShowPlanLassons.click();
chkColoringClasses.click();
chkMyLessons.click();

checkOnlyMyLessons();
