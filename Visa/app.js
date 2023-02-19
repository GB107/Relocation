function myFunction() {
    var firstname = document.getElementById('in').value;
    console.log(firstname);
    let st="https://visaindex.com/country/"+firstname+"-passport-ranking/";
    console.log(st);
    window.open(st,"_self");
  }

