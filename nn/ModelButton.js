/**
 * Authors : Biloni Kim, Donzé Célien & Vorpe Fabien
 * Descrption : ModelButton provide the creation of a button,
 * the loading and use of a model
*/

class ModelButton {
    /**
     * 
     * @param {Objet} divElement 
     * @param {String} id 
     * @param {String} path 
     */
    constructor(divElement, id, path) {
        this.nom = id;
        this.path = path;
        this.isSelected = false;

        // construction of the button
        this.button = document.createElement('button');
        this.button.setAttribute('id', this.nom);
        this.button.innerText = this.nom;
        this.button.onclick = function toggle() {
            console.log(this);
            if(this.isSelected) {
                ModelButton.unselected(this);
            } else {
                ModelButton.selected(this);
            }
        };
        console.log(this.button);
        divElement.appendChild(this.button);

        this.load();
    }

    static selected(button) { 
        alert('selected');
    }

    static unselected(button) {
        alert('unselected');
    }

    async load() {
        //console.log(this);
    }
}