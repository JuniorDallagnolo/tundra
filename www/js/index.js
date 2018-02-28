//Core APP Engine
var APP = (function () {

    let url = 'http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=';
    let imgURL = "";
    let profiles = [];
    let gender = "male"; //Default selector is for males

    //Initialization function for gender selection
    function init() {
        //Create Tiny shell instance for gender selcetion
        let tiny = new t$(document.getElementById('gender'));
        tiny.addEventListener('swipeleft', opening);
        tiny.addEventListener('swiperight', opening);
        
    }

    //Opening function that builds the default app layout
    function opening(ev) {
        if (ev.type == 'swiperight') {
            gender = "female";
        }
        document.getElementById('js-male').classList.add('js-moveLeft');
        document.getElementById('js-female').classList.add('js-moveRight');
        fetchProfiles();
        //For First run just removes the initial gender selection and add active on MAIN CONTENT
        setTimeout(() => {
            document.getElementById('gender').classList.remove('active');
        }, 500); //Timeout to handle Opening animation effect
        //Create Tiny shell instance for navigation Between tabs
        let nmgr = new t$(document.querySelectorAll(".bar .tab"));
        nmgr.addEventListener(t$.EventTypes.TAP, nav);
        document.getElementById('main').classList.add('active');
        document.getElementById('home').classList.add('current');
    }

    //Basic navigation function between the 2 tabs
    function nav(ev) {
        switch (ev.target.id) {
            case 'home':
                document.getElementById('main').classList.add('active');
                document.getElementById('home').classList.add('current');
                document.getElementById('favorites').classList.remove('active');
                document.getElementById('favs').classList.remove('current');
                break;
            case 'favs':
                document.getElementById('favorites').classList.add('active');
                document.getElementById('favs').classList.add('current');
                document.getElementById('main').classList.remove('active');
                document.getElementById('home').classList.remove('current');
                break;
        }
    }

    //Basic Fetch function that is called multiple times over the app
    function fetchProfiles() {
        url += gender; // Adding choosed gender
        fetch(url)
            .then(response => response.json())
            .then((data) => {
                imgURL = "http:" + decodeURIComponent(data.imgBaseURL);
                profiles = profiles.concat(data.profiles);
                cardBuilder(profiles);
            })
            .catch(function (err) {
                console.log(err);
            })
    }

    function cardBuilder(arr) {
        let df = document.createDocumentFragment();
        let main = document.getElementById('main');
        arr.forEach(person => {
            //Create the Card and set class
            let div = document.createElement('div');
            div.classList.add('card');
            div.classList.add('fixed');
            div.classList.add('nobar');
            div.classList.add('top');
            div.setAttribute('id', person.id);
            //Create Header for Name
            let header = document.createElement('header');
            div.appendChild(header);
            let h2 = document.createElement('h2');
            h2.textContent = `${person.first} ${person.last}`;
            header.appendChild(h2);
            //Create Image tag and add avatar
            let img = document.createElement('img');
            img.src = imgURL + person.avatar;
            img.alt = `A ${person.gender} avatar picture`;
            div.appendChild(img);
            //Create Distance
            let p = document.createElement('p');
            p.textContent = `${person.first} is ${person.distance} away from you.`
            div.appendChild(p);
            df.appendChild(div);
        });
        //Making sure clean all divs before adding new ones;
        main.innerHTML = "";
        main.appendChild(df);
        setTimeout(() => {
            main.firstElementChild.classList.remove('top');
            main.firstElementChild.classList.add('active');
        }, 100); //Timeout to handle First Card Top animation effect
        addHandlers();
    }

    //Addling the tinyshell swipes handlers to the cards
    function addHandlers() {
        //Create Instance of tiny shell for handling accept and reject.
        cardsNode = document.querySelectorAll('.card');
        let mgr = new t$(cardsNode);
        mgr.addEventListener(t$.EventTypes.SWIPELEFT, swipeFunc);
        mgr.addEventListener(t$.EventTypes.SWIPERIGHT, swipeFunc);
    }

    //Compact function that recognizes swipe to animate screen
    function swipeFunc(ev) {
        switch (ev.type) {
            case "swipeleft":
                ev.target.classList.add("left");
                prompt('reject');
                break;
            case "swiperight":
                ev.target.classList.add("right");
                prompt('accept');
                sessionStorage.setItem(profiles[0].id, JSON.stringify(profiles[0]));
                genFavs();
                break;
        }
        setTimeout(() => {
            var element = document.getElementById("main").firstElementChild;
            element.outerHTML = "";
            delete element;
            document.getElementById("main").firstElementChild.classList.add('active');
            document.getElementById("main").firstElementChild.classList.remove('top');
            profiles.shift();
            if (profiles.length < 3) {
                fetchProfiles();
            }
        }, 100);
    }

    //Overlay fucntion to display message and prompts !!!!!WORK IN PROGRESS for YES AND NO
    function prompt(scope) {
        let overlay = document.querySelector('.overlay-bars');
        switch (scope) {
            case 'accept':
                document.querySelector('.info').innerHTML = "Added to Favorites";
                break;
            case 'reject':
                document.querySelector('.info').innerHTML = "Dismissed profile";
                break;
            case 'delete':
                document.querySelector('.info').innerHTML = "Removed from favorites";
                break;
        }
        overlay.classList.add('active');
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 200); //Timeout for animation
    }

    function genFavs() {
        //Creating Empty array and adding whatever is on sessionStorage to it
        let favorites = [];
        for (let i = 0, key, len = sessionStorage.length; i < len; i++) {
            key = sessionStorage.key(i);
            favorites.push(JSON.parse(sessionStorage[key]));
        }
        //Create basic html structure
        favs = document.getElementById('favorites');
        listBuilder(favorites);
        //Adling tiny shell tap events for deleting
        let tis = new t$(document.querySelectorAll(".action-right"));
        tis.addEventListener(t$.EventTypes.TAP, deleteFav);
    }

    function listBuilder(arr) {
        let ul = document.createElement('ul');
        ul.classList.add('list-view');
        arr.forEach((profile) => {
            //Creates the List ITEM element
            let li = document.createElement('li');
            li.classList.add('list-item');
            li.setAttribute('id', profile.id);
            //Creating the User Mini avatar
            let img = document.createElement('img');
            img.src = imgURL + profile.avatar;
            img.alt = `A ${profile.gender} avatar picture`;
            img.classList.add('avatar');
            li.appendChild(img);
            //Create the paragraph and action button
            let p = document.createElement('p');
            p.textContent = `${profile.first} ${profile.last}`;
            li.appendChild(p);
            let span = document.createElement('span');
            span.classList.add('action-right');
            span.classList.add('icon');
            span.classList.add('clear');
            li.appendChild(span);
            ul.appendChild(li);
        });
        document.getElementById('favorites').innerHTML = "";
        document.getElementById('favorites').appendChild(ul);
    }

    function deleteFav(ev) {
        prompt('delete');
        var element = ev.target.parentElement;
        sessionStorage.removeItem(element.getAttribute('id'));
        element.outerHTML = "";
        delete element;
    }

    let loadEvent = ('deviceready' in document) ? 'deviceready' : 'DOMContentLoaded';
    document.addEventListener(loadEvent, init);

})();