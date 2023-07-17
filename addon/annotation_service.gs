const decisionEnum = ["NA", "Demandes accueillies", "Rejet", "Ne statue pas sur le fond", "Demandes partiellement accueillies"]
const statusEnum = ["En cours", "Finie", "En appel"]
const typeEnum = ["Climat", "Environnement", "Climat/Environnement"]
const agentTypeEnum = ["Entreprise", "Etat", "Organisme publique", "Association", "Particulier"]
const groundTypeEnum = ["Public trust", "Tort law", "Droits humains", "Normes environnementales", "Droit civil"]
const resourceTypeEnum = ["Décision", "Ouvrage/Article", "Newsletter"]

const attributeTypeMap = {
  "agent":agentTypeEnum,
  "ground":groundTypeEnum,
  "resource":resourceTypeEnum
}

const validationDict = {
  "title": {"name": "Titre", "type": "text", "required": true, "order": 1},
  "abstract": {"name": "Résumé", "type": "text", "required": true, "order": 2},
  "introduction_date": {"name": "Date d'introduction", "type": "date", "required": true, "order": 3},
  "final_decision_date": {"name": "Date de décision", "type": "date", "required": false, "order": 4},
  "complainants": {"name": "Partie(s) demanderesse(s)", "type": "agent", "required": true, "order": 5},
  "complainant_receivers": {"name": "Partie(s) défenderesse(s)", "type": "agent", "required": true, "order": 6},
  "jurisdiction": {"name": "Juridiction", "type": "text", "required": true, "order": 7},
  "grounds": {"name": "Norme/Fondement", "type": "ground", "required": false, "order": 8},
  "resources": {"name": "Documents associés", "type": "resource", "required": false, "order": 9},
  "comments": {"name": "Commentaires", "type": "text", "required": false, "order": 10},
  "appeal_type": {"name": "Type de recours", "type": "enum", "required": true, "options": typeEnum, "order": 11},
  "legal_case_status": {"name": "Statut de l'affaire", "type": "enum", "required": false, "options": statusEnum, "order": 12},
  "final_decision": {"name": "Sens de la décision", "type": "enum", "required": false, "options": decisionEnum, "order": 13}
};

Array.prototype.findIndex = function(search){
  if(search == "") return false;
  for (var i=0; i<this.length; i++)
    if (this[i][0].includes(search)) return i;

  return -1;
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 */
function showAnnotationSidebar() {
  html = createSidebar();
  DocumentApp.getUi().showSidebar(html);
}

function createSidebar() {
    var doc = HtmlService.createTemplateFromFile('annotation_sidebar');
    html = doc.evaluate();
    html.setTitle('NAATation');
    return html;
}

function initAnnotations() {
  var annotationDict = Object.assign({}, validationDict);
  var props = PropertiesService.getDocumentProperties();

  Object.keys(validationDict).forEach(function(key) {
    var attributeValue = props.getProperty(key);
    if (attributeValue) {
      annotationDict[key]["value"] = attributeValue;
    } else {
      if (annotationDict[key]["type"] == "enum") {
        annotationDict[key]["value"] = annotationDict[key]["options"][0];
      } else {
        annotationDict[key]["value"] = null;
      }
    }
  });
  
  return annotationDict;
}

function updateAnnotationType(containerId, spanContent, selectedType) {
  const key = containerId.replace("-container", "");

  var props = PropertiesService.getDocumentProperties();
  var returnedDict = Object.assign({}, validationDict[key]);
  returnedDict["value"] = props.getProperty(key);

  var values = returnedDict["value"].split("*SEP*");

  if (values.length > 1) {
    const coreValues = values.map(function(value) {
      return value.split("*OPTION*")[0];
    });
    
    var index = coreValues.indexOf(spanContent);
    if (index !== -1) {
      values[index] = spanContent + "*OPTION*" + selectedType;
    }

    returnedDict["value"] = values.join("*SEP*");
  } else {
    returnedDict["value"] = spanContent + "*OPTION*" + selectedType;
  }

  props.setProperty(key, returnedDict["value"]);
}

function removeAnnotation(attributeKey, contentToRemove) {
  const key = attributeKey.replace("-container", "");
  var props = PropertiesService.getDocumentProperties();
  
  var returnedDict = Object.assign({}, validationDict[key]);
  returnedDict["value"] = props.getProperty(key);

  switch (returnedDict["type"]) {
    case "text":
      returnedDict["value"] = null;
      break;
    case "date":
      returnedDict["value"] = null;
      break;
    case "agent":
    case "ground":
    case "resource":
      var values = returnedDict["value"].split("*SEP*");

      const coreValues = values.map(function(value) {
        return value.split("*OPTION*")[0];
      });

      var index = coreValues.indexOf(contentToRemove);
      if (index !== -1) {
        values.splice(index, 1);
      }

      returnedDict["value"] = values.join("*SEP*");
      break;
    default:
      console.log("Unknown annotationValue type");
  }

  if (returnedDict["value"]) {
    props.setProperty(key, returnedDict["value"]);
  } else {
    props.deleteProperty(key);
  }

  var result = {};
  result[key] = returnedDict;
  return result;
}

function highlightSelection(attributeKey, value) {
  const key = attributeKey.replace("-container", "");
  var props = PropertiesService.getDocumentProperties();

  var returnedDict = Object.assign({}, validationDict[key]);
  returnedDict["value"] = props.getProperty(key);

  if (returnedDict["type"] == "enum") {
    props.setProperty(key, value);
    return null;
  }

  const doc = DocumentApp.getActiveDocument();
  const range = doc.getSelection();
  
  if (range) {
    const rangeElements = range.getRangeElements();
    var selectedTexts = [];

    rangeElements.forEach(function (rangeElement) {
      var selectedTextElement = rangeElement.getElement().asText();
      if (rangeElement.isPartial()) {
        const selectedText = selectedTextElement.getText().slice(rangeElement.getStartOffset(), rangeElement.getEndOffsetInclusive() + 1);
        selectedTexts.push(selectedText);
      } else {
        selectedTexts.push(selectedTextElement.getText());
      }
    });

    updateSelectedAnnotation(returnedDict, selectedTexts.join(" "));
    props.setProperty(key, returnedDict["value"]);

    var result = {};
    result[key] = returnedDict;
    return result;
  } else {
    showRequireSelectionError();
    return null;
  }
}

function updateSelectedAnnotation(annotationDict, selectedText) {
  switch (annotationDict["type"]) {
    case "text":
      annotationDict["value"] = selectedText;
      break;
    case "date":
      annotationDict["value"] = selectedText;
      break;
    case "agent":
    case "ground":
    case "resource":
      if (annotationDict["value"]) {
        var currentValues = annotationDict["value"].split("*SEP*");
        const coreValues = currentValues.map(function(value) {
          return value.split("*OPTION*")[0];
        });

        if (coreValues.includes(selectedText)) {
          break;
        }
        annotationDict["value"] += "*SEP*" + selectedText + "*OPTION*" + attributeTypeMap[annotationDict["type"]][0];
      } else {
        annotationDict["value"] = selectedText + "*OPTION*" + attributeTypeMap[annotationDict["type"]][0];
      }
      break;
    default:
      console.log("Unknown annotationValue type");
  }
  return annotationDict;
}

function showRequireSelectionError() {
  ui = DocumentApp.getUi();
  ui.alert("Aucun texte n'a été sélectionné", "Veuillez sélectionnez du texte avant l'annotation.", ui.ButtonSet.OK);
}

function resetDocumentProperties() {
  var props = PropertiesService.getDocumentProperties();
  props.deleteAllProperties();
}

function checkSheetHeaders(sheet){
  Object.keys(validationDict).forEach(function(key) {
    var columnIndex = validationDict[key]["order"] + 1;
    var headerValue = sheet.getRange(1, columnIndex, 1).getValue();
    if (headerValue != validationDict[key]["name"]){
      var cellValue = sheet.getRange(1, columnIndex, 1);
      cellValue.setValues([[validationDict[key]["name"]]]);
    }
  });

  var headerValue = sheet.getRange(1, 1, 1).getValue();
  if (headerValue != "Document Url") {
    var cellValue = sheet.getRange(1, 1, 1);
    cellValue.setValues([["Document Url"]]);
  }
}

function exportToSpreadSheet(){
  const docId = getDocId();
  const docUrl = getDocUrl();

  // look for the document url in the sheet
  var affaireSpreadSheet = SpreadsheetApp.openById("1bpOTcR6ZXJK6PfdY4hHASbXsmzIg_Fbk29-9yWi1T70");
  var sheet = affaireSpreadSheet.getSheetByName("décisions");

  checkSheetHeaders(sheet);

  var columnValues = sheet.getRange(2, 1, sheet.getLastRow()).getValues(); // 1st is header row

  const annotationDict = initAnnotations();

  var searchResult = columnValues.findIndex(docId); //Row Index - 2

  var rowIndex = sheet.getLastRow();

  if(searchResult != -1)
  {
    // searchResult + 2 is row index
    rowIndex = searchResult + 2;
  } else if(rowIndex == 1) {
    rowIndex = 2;
  }

  var cellContent = sheet.getRange(rowIndex, 1);
  cellContent.setValues([[docUrl]]);

  Object.keys(annotationDict).forEach(function(key) {
    var cellContent = sheet.getRange(rowIndex, annotationDict[key]["order"] + 1);

    var cellValue = annotationDict[key]["value"];

    if (Object.keys(attributeTypeMap).includes(annotationDict[key]["type"]) && cellValue){
      cellValue = cellValue.replaceAll("*SEP*", "\n");
      cellValue = cellValue.replaceAll("*OPTION*", " -- ");
    }
    cellContent.setValues([[cellValue]]);
  });
}


