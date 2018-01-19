// load pmml model
let pmmlPath = "kss_var.xml"
var Connect = new XMLHttpRequest();
Connect.open("GET", pmmlPath, false);
Connect.setRequestHeader("Content-Type", "text/xml");
Connect.send(null);
var pmmlDoc = Connect.responseXML;

// Load xsl file
let xslPath = "pmml2js_dt_4_3_with_compound_sp.xsl"
Connect.open("GET", xslPath, false);
Connect.setRequestHeader("Content-Type", "text/xml");
Connect.send(null);
var xsltFile = Connect.responseXML;
console.log(xsltFile)

// transform xml with xsl
function transform() {
    xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltFile);
    resultDocument = xsltProcessor.transformToFragment(pmmlDoc, document);
    return {code: resultDocument.textContent};
}

// write on html
let gen = transform();
console.log(gen)
document.write(gen.code);