/**
 * Utility functions used throughtout the code
 */
'use strict';

function clearChildren(element) {
    for (var i = 0; i < element.childNodes.length; i++) {
        var e = element.childNodes[i];
        if (e.tagName)
            switch (e.tagName.toLowerCase()) {
                case 'input':
                    switch (e.type) {
                        case "radio":
                        case "checkbox":
                            e.checked = false;
                            break;
                        case "button":
                        case "submit":
                        case "image":
                            break;
                        default:
                            e.value = '';
                            break;
                    }
                    break;
                case 'select':
                    e.selectedIndex = 0;
                    break;
                case 'textarea':
                    e.innerHTML = '';
                    break;
                default:
                    clearChildren(e);
            }
    }
}

function mergeInto(o1, o2) {
  if (o1 === null || o2 === null)
    return o1;

  for (var key in o2)
    if (o2.hasOwnProperty(key))
      o1[key] = o2[key];

  return o1;
}

