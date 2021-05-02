// ==UserScript==
// @name         Vocabulary.com answer bot
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  The more questions you answer the better he will get!!
// @author       GSRHackZZ
// @match        https://www.vocabulary.com/*
// @grant        none
// @icon         https://www.flaticon.com/svg/3309/3309130.svg
// ==/UserScript==

let dataSet = {"word":"","def":"","example":"","choices":[],"quest":"","prediction":"Unknown yet. Keep working and the robot will learn from your mistakes 😊"};
let choiceFormat = ["A","B","C","D","Unknown yet. Keep working and the robot will learn from your mistakes 😊"]
let prev;

if(localStorage.getItem("prev")!==null){
    prev=JSON.parse(localStorage.getItem("prev"))
}
else{
    prev=[""]
}

window.addEventListener("contextmenu",function(evt){
    evt.preventDefault();
    let questions = document.getElementsByClassName("challenge-history")[0].children[1].children
    prepData(getQuest(questions));
})

function getQuest(arr){
    for(let i=0;i<arr.length;i++){
        if(arr[i].className.includes("selected")){
            return Number(arr[i].innerText-1)
        }
    }
}

function prepData(quest){
    let param = window.getSelection().toString();
    if(param.trim().length>0){
        let choices = document.getElementsByClassName("question")[quest].children[3].children
        dataSet.word = param
        dataSet.choices = choices
        dataSet.quest=quest
        findWord()
    }
}

async function findWord(){
    try{
        dataSet.prediction=4
        let word = dataSet.word
        let api=`https://vocabulary.now.sh/words/${word}`;
        let api2=`https://vocabulary.now.sh/word/${word}`;
        let result=await fetch(api).then(data => data.json()).then(data => data.data[0]);
        dataSet.example=await fetch(api2).then(data => data.json()).then(data => data.data);
        dataSet.word = await result.name;
        dataSet.def = await result.description;
        checkChoices(dataSet.choices,1)
        checkChoices(dataSet.choices,2)
        let elem = document.getElementsByClassName("mode")[dataSet.quest]
        elem.style="";
        elem.innerHTML=`
        <div style='cursor:text;background:white;overflow:auto;width:400px;height:auto;border:1px solid lightgrey;border-radius:5px;margin-right:-500px;margin-bottom:200px;padding:5px;color:black;box-shadow:2px 2px 5px black'>
             ${"<strong>"+dataSet.word +"</strong> : "+ dataSet.def +"<br><br><b>Example:</b> "+ dataSet.example + "<br><br><strong>Predicted Choice: </strong>" + choiceFormat[dataSet.prediction]}
        </div>`
        grabChoice(dataSet.choices)
    }
    catch(e){
        alert("No definition found...maybe. Refresh and try again, if the same thing happens then yeah, there is no definition.")
        console.error(e)
    }
}


function checkChoices(choices,mode){
    if (mode==1){
        for(let i=0;i<choices.length;i++){
            if(choices[i].innerText.includes(dataSet.def)||dataSet.example.includes(choices[i].innerText)||dataSet.def.includes(choices[i].innerText)){
                choices[i].style="color:springgreen;transition:.6s";
                dataSet.prediction = i
            }
        }
    }
    if(mode==2){
        for(let i=0;i<choices.length;i++){
            for(let j=0;j<prev.length;j++){
                if(prev[j].word==dataSet.word){
                    if(choices[i].innerText.includes(prev[j].choice)||prev[j].choice.includes(choices[i].innerText)){
                        cleanUp(choices)
                        choices[i].style="color:springgreen;transition:.6s";
                        dataSet.prediction = i
                    }
                }
            }
        }
    }
}

function grabChoice(choices){
    for(let i=0;i<choices.length;i++){
        choices[i].addEventListener("click",function(evt){
            setTimeout(function(){
                if(choices[i].className=="correct"){
                    learn(choices[i].innerText)
                }
                if(!isNaN(Number(dataSet.prediction))){
                    if(choices[dataSet.prediction].className=="incorrect"){
                        alert("The robot has learned from it's mistake, this won't happen again. 😅")
                        console.log("Man, I sure am dumb.... 😐")
                    }
                }
            },500)
        })
    }
}


function learn(answer){
    let wrd = dataSet.word
    let combo = {wrd:answer}
    for(let i=0;i<prev.length;i++){
        if(prev[i].combo==combo){
            break
        }
        if(prev.length-1==i){
            prev.push({"word":dataSet.word,"choice":answer,"combo":combo})
            console.log(`${dataSet.word} has been learned!`)
            localStorage.setItem("prev",JSON.stringify(prev));
        }
    }
}


function cleanUp(choices){
    for(let i=0;i<choices.length;i++){
        choices[i].style.color="#36588e";
    }
}



window.addEventListener("keyup",function(){
    let quests = document.getElementsByClassName("challenge-history")[0].children[1].children
    let quest = document.getElementsByClassName("question")
    let words=getWords(quest[getQuest(quests)].children[1].children[1].children[1]);
    let empty = "No words that I know of match what you are trying to spell... 😅";
    let result;
    if(!words){
        result = empty;
    }
    else{
        result = words.join("<br/>");
    }
    let elem = document.getElementsByClassName("mode")[getQuest(quests)]
    elem.style="";
    elem.innerHTML=`
        <div style='display:flex;justify-content:center;font-size:15px;padding:10px;cursor:text;background:white;overflow:auto;width:fit-content;max-width:250px;height:auto;max-height:350px;border:1px solid lightgrey;border-radius:5px;margin-right:-500px;margin-bottom:calc(height-height/2);padding:5px;color:black;box-shadow:2px 2px 5px black'>
             ${result}
        </div>`
})

function getWords(txtField){
    if(txtField){
        if(txtField.value.trim().length>0){
            let result=[];
            let val = txtField.value
            for(let j=1;j<prev.length;j++){
                if((prev[j].word).includes(val)){
                    if(!result.includes(prev[j].word)){
                        result.push(prev[j].word)
                    }
                }
                if(prev.length-1==j){
                    if(result.length>0){
                        return result;
                    }
                    else{
                        return false;
                    }
                }
            }
        }
    }
}





