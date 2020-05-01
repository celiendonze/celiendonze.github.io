function changeImage() {
    console.log(document.getElementById("imgClickAndChange").src)
    if (document.getElementById("imgClickAndChange").src.includes("kdo_ferme.jpg")) 
    {
        document.getElementById("imgClickAndChange").src = "kdo_ouvert.png";
    }
    else 
    {
        document.getElementById("imgClickAndChange").src = "kdo_ferme.jpg";
    }
}