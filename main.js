function normalizeCzech(str) {
  return str.toLowerCase()
    .replace(/á/g, 'a').replace(/č/g, 'cz').replace(/ď/g, 'd')
    .replace(/é/g, 'e').replace(/ě/g, 'e').replace(/í/g, 'i')
    .replace(/ň/g, 'n').replace(/ó/g, 'o').replace(/ř/g, 'rz')
    .replace(/š/g, 'sz').replace(/ť/g, 't').replace(/ú/g, 'u')
    .replace(/ů/g, 'u').replace(/ý/g, 'y').replace(/ž/g, 'zz');
}

function sortCitations() {
  const input = document.getElementById("input").value;
  const lines = input.split(/\r?\n/).filter(line => line.trim().startsWith("["));

  const originalMap = lines.map((line, idx) => {
    const match = line.match(/^\[(\d+)\]/);
    return { original: match ? match[1] : String(idx + 1), line };
  });

  originalMap.sort((a, b) => {
    const cleanA = normalizeCzech(a.line.replace(/^\[\d+\]\s*/, ""));
    const cleanB = normalizeCzech(b.line.replace(/^\[\d+\]\s*/, ""));
    return cleanA.localeCompare(cleanB);
  });

  const renumbered = [];
  const mappingAddLines = [];

  originalMap.forEach((item, newIndex) => {
    const newNumber = newIndex + 1;
    const stripped = item.line.replace(/^\[\d+\]\s*/, "");
    const line = `[${newNumber}] [původně: ${item.original}] ${stripped}`;
    renumbered.push(line);
    mappingAddLines.push(`    mapping.Add "${item.original}", "${newNumber}"`);
  });

  const finalVBScript = [
    'Sub PrecislovatCitaceCesky()',
    '    Dim mapping As Object',
    '    Set mapping = CreateObject("Scripting.Dictionary")',
    '',
    ...mappingAddLines,
    '',
    '    Dim key As Variant',
    '    For Each key In mapping.Keys',
    '        With Selection.Find',
    '            .ClearFormatting',
    '            .Replacement.ClearFormatting',
    '            .Text = "{{" & key & "}}"',
    '            .Replacement.Text = "[" & mapping(key) & "]"',
    '            .Forward = True',
    '            .Wrap = wdFindContinue',
    '            .Execute Replace:=wdReplaceAll',
    '        End With',
    '    Next key',
    '',
    '    MsgBox "Citace zmeneny na pozadovany format z {{cislo}} na [cislo] podle pozadovaneho poradi", vbInformation',
    'End Sub'
  ].join('\n');

  document.getElementById("output").value = renumbered.join("\n\n");
  document.getElementById("vbsOutput").value = finalVBScript;
}

function copyOutput() {
  const out = document.getElementById("output");
  out.select();
  document.execCommand("copy");
}

function copyMapping() {
  const out = document.getElementById("vbsOutput");
  out.select();
  document.execCommand("copy");
}

document.addEventListener('DOMContentLoaded', () => {
  sortCitations();
});
