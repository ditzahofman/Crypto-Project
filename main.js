/// <reference path="jquery-3.6.3.js" />
$(() => {
  const coinsArray = []
  $("section").hide()
  $("#homeSection").show()

  $("a").on("click", function () {
    let dataSection = $(this).attr("data-section")
    $("section").hide()
    $(`#${dataSection}`).show()
  })

  $("#home").click(function () {
    $("#myInput").show()
  })

  //to get ajax
  function ajax(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: url,
        data: {
          key: 'value',
        },
        beforeSend: function () {
          // Show image loader
          $(".loader").show();
           },
        success: function (data) {
          resolve(data)
        },
        complete: function (data) {
          // Hide image loader
          $(".loader").hide();
              },
        error: function (error) {
          reject(error)
        },
      })
    })
  }


  async function returnAjzx(url) {
    try {
      let Ajax = await ajax(url)
      return Ajax
    } catch (error) {
      alert(error)
    }

  }
  handleCoins()

  async function handleCoins() {
    try {
      let loud = ` <div class="loader"><h2>Coins being loaded...</h2><img src="MnyxU.gif"/></div>`
      $("#homeSection").append(loud)
         let coins = await returnAjzx(`https://api.coingecko.com/api/v3/coins/`)
      for (let i = 0; i < 50; i++) {
        coinsArray.push(coins[i])
      }
      console.log(coinsArray)
      displayCoins(coins)
    } catch (error) {
      document.write(error)
    }

  }

   function createcard(coin,i) {
         card = `<div class=card>
<div class="contantcard">
  <div class="form-check form-switch danger">
    <input class="form-check-input" type="checkbox" role="switch" id="${coin.symbol.toUpperCase()}" name="${coin.symbol.toUpperCase()}">
    <label class="form-check-label labelCard"  for="flexSwitchCheckDefault">${coin.symbol}</label>
    <img class="imgcoin" src="${coin.image.small}">
  </div>
  <p class="id">${coin.id}</p>
</div>
<button class="btn-moreinfo" id="${i}" data-bs-toggle="collapse" data-bs-target="#${coin.id}"
aria-expanded="false" aria-controls="collapseExample">moreinfo</button>
<div class="collapse text-collapse collapseCard" id="${coin.id}"></div>
</div>
`
return card
  }

 //show cards with content
  function displayCoins(coins) {
    let i = 0
    let content = ""
    for(const coin of coins) {
        const card = createcard(coin,i)
        content += card
        i++
    }
    $("#homeSection").html(content)
    loadFromStorage()
    moreinfo()
    checkCoin()
 }
 
//searching
  $("#myInput").on("keyup", function () {
    const textToSearch = $(this).val().toLowerCase()
    if (textToSearch ===0){
          displaycard(coinsArray)
    }
    else {
      const filteredCoins = coinsArray.filter(coinsArray => coinsArray.symbol.indexOf(textToSearch) >= 0)
         displayCoins(filteredCoins)
    }

  })

  //return ajax moreinfo from api or from seissonStorage
  async function getMoreInfo(coinId) {
    let json = sessionStorage.getItem(coinId)
    if (json) {
      let collapseRemember = JSON.parse(json)
      console.log(1)
      return collapseRemember
    }
    else {
      let collapse = await returnAjzx(`https://api.coingecko.com/api/v3/coins/${coinId}`)
      sessionStorage.setItem(coinId, JSON.stringify(collapse));
      console.log(2)
      return collapse
    }
  }


  //getting moreinfo
  function moreinfo() {
    $(`.collapseCard`).on('shown.bs.collapse', async function () {
      let btn = $(this).siblings("button").attr("id")
      let coinId = $(this).attr("id")
      $(`#${btn}`).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`)
      //loader in collapse
      let loud = ` 
            <div class="loadercollapse">
          <img src="Dollar gold coin.gif" width="50px">
           </div>
           `
      $(this).html(loud)
      let moreinfo = await getMoreInfo(coinId);
      let addCard =
          `<b> usd:</b>${moreinfo.market_data.current_price.usd}<img src="Dollar sign revolving.gif" width="20"><br>
            <b> eur:</b>${moreinfo.market_data.current_price.eur}<img src="Euro sign spinning.gif" width="20"><br>
            <b>ils:</b>${moreinfo.market_data.current_price.ils}<img src="Israel shekel sign rotating (1).gif" width="20">`
      $(`.loadercollapse`).html(addCard)
    
      if ($(this).html(addCard)) {
        //cgange the html button
        $(`#${btn}`).html("moreinfo")
      }

      //remove from storage after 2 seconds
      setTimeout(function () {
        sessionStorage.removeItem(coinId);
      }, 2000 * 60);
    })

  }

  //choose 5 coins and change with modal
  let SelectedCoins = []
  function checkCoin(){
  $(".card").on("change", "input", function () {
    let idInput = $(this).attr("id")
    SelectedCoins.length > 4 && $(this).is(":checked") ?
      $(this).prop("checked", false) && createModal(idInput) : SelectedCoins.push(idInput);
       if ($(this).is(":checked") === false) {
      SelectedCoins = jQuery.grep(SelectedCoins, function (value) {
        return value != idInput;
      })

    }
    SaveInLocalStorage()
    console.log(SelectedCoins)
  })
}
  // create modal
  function createModal(idInput) {
    let inputToCheck = ""
    for (let i = 0; i < SelectedCoins.length; i++) {
      inputToCheck += ` <div class="form-check form-switch">
<input class="form-check-input checkmodal" type="checkbox" name=${SelectedCoins[i]} checked >
<label class="form-check-label labelCard"  for="flexSwitchCheckChecked">${SelectedCoins[i]}</label>
</div>`
    }
    let modal = ` <div class="modal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title"><img src="Dollar gold coin.gif"> Error </h2>
      </div>
      <div class="modal-body">
         <div class="modal-border p-modal">
         You can only choose five coins!!!<br>
         By deleting a coin or coins and clicking save <br>
         The ${idInput} coin will join the report of the selected coins
          </div>
      <h2>Your selectted coins now:</h2>
      ${inputToCheck}
      </div>
          <div class="modal-footer">
          <button type="button" class="btn btn-primary" id="close">close</button> 
         <button type="button" class="btn btn-primary" id="save">Save changes</button> 
    </div>
  </div>
</div>`
    $(".card").last().append(modal)
    $(".modal").show()
    save(idInput)
    close()
    SaveInLocalStorage()
  }

  //save
  function save(idInput) {
    $(".modal").on("click", "#save", function () {
      $('.checkmodal').each(function () {
        let name = $(this).attr('name');
        if ($(this).is(':checked') === false) {
          SelectedCoins = jQuery.grep(SelectedCoins, function (value) {
            return value != name;

          })
          $(`#${name}`).prop("checked", false)
        }
        $('.modal').remove();
      });
           //push the last button that not selected to array and check it becouse the changes in the modal
      if (SelectedCoins.length < 5) {
        SelectedCoins.push(idInput)
        $(`#${idInput}`).prop("checked", true)
        SaveInLocalStorage()
      }
      console.log(SelectedCoins)
    })
  }

  //close without changes
  function close() {
    $(".modal").on("click", "#close", function () {
        $('.modal').remove();
    })
  }

  //save in local 
  function SaveInLocalStorage() {
    $('input[type="checkbox"]').each(function () {
      let id = $(this).attr('name');
      let value = $(this).val();
      if ($(this).is(':checked')) {
        console.log(value);
        localStorage.setItem(id, value);
      }
      else {
        localStorage.removeItem(id);
        localStorage.removeItem(value);
      }
    });
  }

  //load from local-storage
  function loadFromStorage() {
    $('input[type="checkbox"]').each(function () {
         let id = $(this).attr('name');
      let checkboxexs = document.getElementsByName(id); // list of radio buttons
      var val = localStorage.getItem(id); // local storage value
      for (var i = 0; i < checkboxexs.length; i++) {
        if (checkboxexs[i].value == val) {
          checkboxexs[i].checked = true; // marking the required radio as checked
       if( SelectedCoins.includes(id)===false)
          SelectedCoins.push(id)
                  }
          }
    });
  }

  //create report
  $("#report").on("click", async function report() {
    $("#reportSection").html("")
      $("#myInput").hide()
    let report=` <div id="chartContainer" style="width: 100%;"></div>`
    $("#reportSection").append(report)
    let loud = ` <div class="loader"><img src="MnyxU.gif"/></div>`
    $("#chartContainer").html(loud)
  
    let datapoint = []
    try {
      let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=`
      for (let coin of SelectedCoins) {
        url += `${coin},`
      }
      url += `&tsyms=USD`
      let data = await returnAjzx(url)
      for (let i = 0; i < SelectedCoins.length; i++) {
        datapoint[i] = {
          type: "line",
          name: SelectedCoins[i],
          showInLegend: true,
          xValueType: "dateTime",
          xValueFormatString: "hh:mm:ss",
          yValueFormatString: "#,##0 $-USD",
          dataPoints: []
        }
      }
      var options = {

        exportEnabled: true,
        animationEnabled: true,
        title: {
          text: "Digital currencies - real-time tracking"
        },
        subtitles: [{
          text: "Click Legend to Hide or Unhide Data Series"
        }],
        axisX: {

          valueFormatString: "hh:mm:ss",
        }
        ,
        axisY: {
          title: "Units Sold",
          titleFontColor: "#4F81BC",
          lineColor: "#4F81BC",
          labelFontColor: "#4F81BC",
          tickColor: "#4F81BC"
        },

        toolTip: {
          shared: true
        },
        legend: {
          cursor: "pointer",
          itemclick: toggleDataSeries
        },
        data: datapoint
      };
      $("#chartContainer").CanvasJSChart(options);
      function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      }
      var updateInterval = 2000;
      var time = new Date;

      async function updateChart() {
        data = await returnAjzx(url)
        time.setTime(time.getTime() + updateInterval);
        for (let a = 0; a < datapoint.length; a++) {
          for (let prop in data[SelectedCoins[a]]) {
            // pushing the new values
            datapoint[a].dataPoints.push({
              x: time.getTime(),
              y: data[SelectedCoins[a]][prop]

            }
            );
          }
        }
        $("#chartContainer").CanvasJSChart().render();
      }
      updateChart()
      $(".loader").remove()
      setInterval(function () { updateChart() }, updateInterval);
    } catch (error) {
      alert(err.message)
    }
    
  })

  // about section
  $("#About").on("click", function () {
       $("#myInput").hide()
    let about = `
       <div><br>
           <div class="w3-row-padding">
               <div class="w3-third">
               <div class=" gold w3-text-grey w3-card-4 border">
                 <div class="w3-display-container">
                   <img id="woman" src="my picture.jpg" width="50%" alt="myPicture" />
                   <h2 class="green text w3-center border">Ditza Hofman</h2>
                               </div>
                 <div class="w3-container">
                   <p><i class="fa fa-briefcase fa-fw w3-margin-right w3-large green"></i>Fullstuck Developer</p>
                   <p><i class="fa fa-home fa-fw w3-margin-right w3-large green"></i>Jerusalem, Israel</p>
                   <p><i class="fa fa-envelope fa-fw w3-margin-right w3-large green"></i>ditzahofman@gmail.com</p>
                   <p><i class="fa fa-phone fa-fw w3-margin-right w3-large green"></i>0548457862</p>
                   <hr>
                   <p class="big text green"><b><i class="fa fa-asterisk fa-fw w3-margin-right green big"></i>Skills</b>
                   </p>
                   <p>Html</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey" style="width:90%">90%</div>
                   </div>
                   <p>Css</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey" style="width:80%">
                       <div class="w3-center w3-text-white">80%</div>
                     </div>
                   </div>
                   <p>Bootstrap</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey" style="width:80%">80%</div>
                   </div>
                   <p>Javascript</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey" style="width:90%">90%</div>
                   </div>
                   <p>Jequary</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey" style="width:75%">75%</div>
                   </div>
                   <p>React</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small ">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey " style="width:50%">50%</div>
                   </div>
                   <p>Priemier</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey" style="width:100%">100%</div>
                   </div>
                   <p>AffterEffects</p>
                   <div class="w3-light-grey w3-round-xlarge w3-small">
                     <div class="w3-container w3-center w3-round-xlarge w3-dark-grey" style="width:80%">80%</div>
                   </div>
                   <br><br><br><br>
                   <p class="big text green"><b><i class="fa fa-globe fa-fw w3-margin-right green big "></i>Languages</b>
                   </p>
                   <p>Hebrow</p>
                   <div class="w3-black w3-round-xlarge">
                     <div class="w3-round-xlarge w3-dark-grey" style="height:24px;width:100%"></div>
                   </div>
                   <p>Einglish</p>
                   <div class="w3-light-grey w3-round-xlarge">
                     <div class="w3-round-xlarge w3-dark-grey" style="height:24px;width:75%"></div>
                   </div>
                   <br>  <br><br><br>
                 </div>
               </div>
              </div>
              <div class="w3-twothird">
              <div class="w3-container w3-card gold border">
                <h2 class="green  w3-padding-16 text"><i
                    class="fa fa-certificate fa-fw w3-margin-right w3-xxlarge green"></i>My project</h2>
                <div class="w3-container">
                  <img id="image-digital" src="coins.jpg" alt="coin-image"/>
                  <h2 class="green text"><b>Digital coins</b></h2>
                  <p>On this site you can track the value of international currency in real time</p>
                  <p> You have to  select up to five coins and by clicking on report you will receive real-time</p>
                  <p> information about the changes of the currency's value</p>
                  <p> And also on every card there is a more info button, 
                  by clicking  it</p>
                  <p> you will get information about the value of the currency by Israeli shekels by dollars and euros</p>
                  <br>
                </div>
              </div>
              <br>
              <div class="w3-container w3-card  gold w3-margin-bottom border">
                <h2 class="green w3-padding-16 text"><i
                    class="fa fa-suitcase fa-fw w3-margin-right w3-xxlarge green"></i>Work Experience</h2>
                <div class="w3-container">
                  <h5 class="gold"><b>Fullstock- developer</b></h5>
                  <h6 class="w3-text-gold"><i class="fa fa-calendar fa-fw w3-margin-right"></i>Jan 2023 - <span
                      class="w3-tag w3-dark-grey w3-round">Current</span></h6>
                  <p>Studying the Fullstuck development course in John Bryce</p>
                  <hr>
                </div>
                <div class="w3-container">
                  <h5 class="gold"><b>Matematic teacher</b></h5>
                  <h6 class="w3-text-gold"><i class="fa fa-calendar fa-fw w3-margin-right"></i>Mar 2007 - Dec 2022
                  </h6>
                  <p></p>
                  <hr>
                </div>
                <div class="w3-container">
                  <h5 class="gold"><b>video editor</b></h5>
                  <h6 class="w3-text-dark-grey"><i class="fa fa-calendar fa-fw w3-margin-right"></i>Jun 2018 - Mar 2023
                  </h6>
                  <hr>
                </div>
              </div>
              <div class="w3-container w3-card  gold gold w3-margin-bottom border">
                <h2 class="green w3-padding-16 text"><i class='fa fa-comments fa-fw w3-margin-right' style='font-size:36px'></i>message</h2>
                <textarea  placeholder="Enter your message"  ></textarea>
               <button class="btnf" type="submit">send message</button>
                  <hr>
                </div>
              </div>
             </div>
           </div>
         </div>
         
         <div class="w3-container w3-center w3-margin-top gold" id="footerAbout">
           <p>Find me on social media.</p>
           <i class="fa fa-facebook-official w3-hover-opacity"></i>
           <i class="fa fa-instagram w3-hover-opacity"></i>
           <i class="fa fa-snapchat w3-hover-opacity"></i>
           <i class="fa fa-pinterest-p w3-hover-opacity"></i>
           <i class="fa fa-twitter w3-hover-opacity"></i>
           <i class="fa fa-linkedin w3-hover-opacity"></i>
         </div>
         <div>`

    $(`#aboutSection`).html(about)

  })
})