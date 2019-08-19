document.addEventListener("DOMContentLoaded", postLoad)

function postLoad() {

    const artistURL = "http://localhost:3000/artists";
    const venueURL = "http://localhost:3000/venues";
    const menuButton = document.querySelector(".menu");
    const sideNavBar = document.querySelector(".nav");
    const innerMenuList = document.querySelector(".inner-menu-list");
    const venuesButton = innerMenuList.querySelector("#venues");
    const menuContainersCollection = document.querySelectorAll(".menu-item-container");
    const venuesContainer = document.querySelector("#venues-container");
    const venueCardsContainer = document.querySelector(".venue-cards-container");
    const easterEgg = document.querySelector(".easter-egg")
    const stopButton = sideNavBar.querySelector("#stop-button")
    const submitButtons = document.querySelectorAll("input[type=submit]");
    const newVenueNameInput = venuesContainer.querySelector("#new-venue-name-input");
    const newVenueNameLabel = venuesContainer.querySelector("#new-venue-name-label");
    const newVenueDescriptionInput = venuesContainer.querySelector("#new-venue-description-input");
    const newVenueDescriptionLabel = venuesContainer.querySelector("#new-venue-description-label");
    submitButtons.forEach(button => button.value = "+");

    fetch(artistURL)
        .then(parseJSON)
        .then(setArtistName)
        .then(setInterval);
        
    fetch(venueURL)
        .then(parseJSON)
        .then(venues => venues.sort(sortVenues))
        .then(displayEachVenue);

    venuesContainer.addEventListener("click", venueEvent);
    innerMenuList.addEventListener("click", displayContainer);
    menuButton.addEventListener("click", toggleMenu);
    easterEgg.addEventListener("click", whackyMode);
    stopButton.addEventListener("click", stopWhackyMode);
    newVenueNameInput.addEventListener("focus", addNameShrinkClass);
    newVenueNameInput.addEventListener("blur", removeNameShrinkClass);
    newVenueDescriptionInput.addEventListener("focus", addDescriptionShrinkClass);
    newVenueDescriptionInput.addEventListener("blur", removeDescriptionShrinkClass);
    
    venuesButton.focus();

    function clickButton(eventClass) {
        click = {
            "venue-delete-button fa fa-times"(){ toggleFrontCardAndDeleteModal(event) },
            "venue-update-button fa fa-pencil"(){ createVenueUpdateForm(event) },
            "update-venue-form-submit"(){ updateVenueInDB(event) },
            "new-venue-form-submit"(){ createNewVenue(event) },
            "venue-modal-delete-buttons fa fa-times"(){ toggleFrontCardAndDeleteModal(event) },
            "venue-modal-delete-buttons fa fa-check"(){ deleteVenueFromDOMandDB(event) },
        };
        return click[eventClass]();
    }

    function addNameShrinkClass() {
        newVenueNameLabel.classList.remove("shrink-uncolored");
        newVenueNameLabel.classList.add("shrink-colored");
    }

    function removeNameShrinkClass() {
        if (!newVenueNameInput.value) {
            newVenueNameLabel.classList.remove("shrink-colored");
            newVenueNameLabel.classList.remove("shrink-uncolored");
        } else {
            newVenueNameLabel.classList.remove("shrink-colored");
            newVenueNameLabel.classList.add("shrink-uncolored");
        }
    }

    function addDescriptionShrinkClass() {
        newVenueDescriptionLabel.classList.remove("shrink-uncolored");
        newVenueDescriptionLabel.classList.add("shrink-colored");
    }

    function removeDescriptionShrinkClass() {
        if (!newVenueDescriptionInput.value) {
            newVenueDescriptionLabel.classList.remove("shrink-colored");
            newVenueDescriptionLabel.classList.remove("shrink-uncolored");
        } else {
            newVenueDescriptionLabel.classList.remove("shrink-colored");
            newVenueDescriptionLabel.classList.add("shrink-uncolored");
        }
    }

    function toggleMenu() {
        sideNavBar.classList.toggle("open");
    }

    function updateVenueInDB(event){
        const updateVenueForm = event.target.parentNode;
        const updateVenueFormData = new FormData(updateVenueForm);
        const name = updateVenueFormData.get("update-venue-name");
        const description = updateVenueFormData.get("update-venue-description");
        const venueId = event.target.dataset.venueId;
        
        fetchCall(`${venueURL}/${venueId}`, "PATCH", {name, description,})
            .then(parseJSON)
            .then(updateVenueInDOM);
    }

    function updateVenueInDOM(updatedVenue) {
        const venueNameTag = document.querySelector(`[data-venue-id='${updatedVenue.id}'] p`);
        const venueDescriptionTag = document.querySelector(`[data-venue-id='${updatedVenue.id}'] span`);
        
        venueNameTag.textContent = updatedVenue.name;
        venueDescriptionTag.textContent = updatedVenue.description;
    }

    function changeDisplay(eventId) {
        const menuContainersList = Array.from(menuContainersCollection);
        menuContainersList.forEach(container => {
            container.style.display = "none"
        });
        const containerShown = document.querySelector(`#${eventId}-container`);
        containerShown.style.display = "grid";
    }

    function displayContainer(event) {
        changeDisplay(event.target.id);
    }

    function setArtistName(artists){
        const artistNameHeader = document.querySelector(".artist-name-header");
        artistNameHeader.textContent = `${artists[0].band_name}`;
    }

    function toggleFrontCardAndDeleteModal(event){
        const venueId = event.target.parentNode.parentNode.dataset.venueId;
        const venueFrontCard = venueCardsContainer.querySelector(`.venue-front-card[data-venue-id='${venueId}']`);
        const venueDeleteModal = venueCardsContainer.querySelector(`.venue-delete-modal[data-venue-id='${venueId}']`);
        
        venueFrontCard.classList.toggle("hidden");
        venueDeleteModal.classList.toggle("hidden");

        if (venueFrontCard.className.includes("hidden")) {
            clickButton(event);
        }
    }
    
    function deleteVenueFromDOMandDB(event) {
        const venueId = event.target.parentNode.parentNode.dataset.venueId;
        fetchCall(`${venueURL}/${venueId}`, "DELETE");
        event.target.parentNode.parentNode.parentNode.remove();
    }
    
    function createVenueUpdateForm(event){
        const venueId = event.target.parentNode.parentNode.dataset.venueId;
        const venueName = venueCardsContainer.querySelector(`[data-venue-id='${venueId}'] p`).textContent;
        const venueDescription = venueCardsContainer.querySelector(`[data-venue-id='${venueId}'] span`).textContent;

        const updateVenueFormHolder = document.querySelector(".update-venue-form-container");
        updateVenueFormHolder.innerHTML = `<form class="update-venue-form">
            <input type="text" name="update-venue-name" class="venue-name-input" id="update-venue-name-input" value="${venueName}"/>
            <textarea type="text" name="update-venue-description" class="venue-description-input" id="update-venue-description-input">${venueDescription}</textarea>
            <input class="update-venue-form-submit" value="&#xf040;" data-venue-id="${venueId}"  type="submit"/>
            </form>`;
    }

    function venueEvent(event){
        event.preventDefault();
        clickButton(event.target.className);
    }

    function createNewVenue(event){
        event.preventDefault();

        const newVenueForm = event.target.parentNode;
        const newVenueFormData = new FormData(newVenueForm);
        const name = newVenueFormData.get("new-venue-name");
        const description = newVenueFormData.get("new-venue-description");

        fetchCall(venueURL, "POST", {name, description,})
            .then(parseJSON)
            .then(setVenueElements);

        event.target.parentNode.reset();
    }
        
    function displayEachVenue(allVenues){
        allVenues.map(setVenueElements);
    }

    function setVenueElements(venue){
        const venuesContainer = document.querySelector(".venue-cards-container");
        
        const venueCardContainer = document.createElement("div");
        venueCardContainer.className = "venue-card-container";

        const venueFrontCard = document.createElement("div");
        venueFrontCard.className = "venue-front-card";
        venueFrontCard.dataset.venueId = venue.id;

        const venueNameDiv = document.createElement("div");
        venueNameDiv.className = "venue-name-div";
        const venueName = document.createElement("p");
        venueName.className = "venue-name";
        venueName.textContent = venue.name;
        venueNameDiv.append(venueName);

        const venueDescriptionDiv = document.createElement("div");
        venueDescriptionDiv.className = "venue-description-div";
        const venueDescription = document.createElement("span");
        venueDescription.className = "venue-description";
        venueDescription.textContent = venue.description;
        venueDescriptionDiv.append(venueDescription);


        const frontCardButtonsDiv = document.createElement("div");
        frontCardButtonsDiv.className = "venue-front-card-buttons-div";
        const deleteButton = document.createElement("button");
        deleteButton.className = "venue-delete-button fa fa-times";
        const updateButton = document.createElement("update");
        updateButton.className = "venue-update-button fa fa-pencil";
        frontCardButtonsDiv.append(updateButton, deleteButton);

        const venueDeleteModal = document.createElement("div");
        venueDeleteModal.className = "venue-delete-modal hidden";
        venueDeleteModal.dataset.venueId = venue.id;

        const venueDeleteAlertDiv = document.createElement("div");
        venueDeleteAlertDiv.className = "venue-delete-alert-div";
        const venueDeleteAlert = document.createElement("h6");
        venueDeleteAlert.className = "venue-delete-alert";
        venueDeleteAlert.textContent = "Goodbye fo-eva?";
        venueDeleteAlertDiv.append(venueDeleteAlert);

        const venueDeleteButtonsContainer = document.createElement("div");
        venueDeleteButtonsContainer.className = "venue-delete-buttons-container";
        const venueCancelDeleteButton = document.createElement("button");
        venueCancelDeleteButton.className = "venue-modal-delete-buttons fa fa-times";
        venueCancelDeleteButton.id = "venue-cancel-delete-button";
        const venueConfirmDeleteButton = document.createElement("button");
        venueConfirmDeleteButton.className = "venue-modal-delete-buttons fa fa-check";
        venueConfirmDeleteButton.id = "venue-confirm-delete-button";

        venueDeleteButtonsContainer.append(venueCancelDeleteButton, venueConfirmDeleteButton);
        venueFrontCard.append(venueNameDiv, venueDescriptionDiv, frontCardButtonsDiv);
        venueDeleteModal.append(venueDeleteAlertDiv, venueDeleteButtonsContainer);
        venueCardContainer.append(venueFrontCard, venueDeleteModal);
        venuesContainer.append(venueCardContainer);
    }
    
    let whackyRepeater = [];
    function whackyMode(){ whackyRepeater.push(setInterval(whackyCSSUpdaterOnTimer)), 10 }
    
    let number = 0;
    // let backgroundNumber = 180;
    function whackyCSSUpdaterOnTimer() {
        if (number < 361) {
            number += 1;
        } else {
            number = 0;
        }
        venueCardsContainer.style.color = `hsl(${number}, 100%, 40%)`;
        venueCardsContainer.style.transform = `rotate3d(2, 5, 2, ${number}deg)`;
        // if (backgroundNumber < 361) {
        //     backgroundNumber += 1;
        // } else {
        //     backgroundNumber = 0 ;
        // }
        // venueCardsContainer.style.transform = `scale(${number})`;
        // venueCardsContainer.style.backgroundColor = `hsl(${backgroundNumber}, 100%, 40%)`;
    }

    function stopWhackyMode() {
        whackyRepeater.forEach(repeat => clearInterval(repeat));
        venueCardsContainer.style.color = `#003049`;
        venueCardsContainer.style.transform = `none`;
    }

    function sortVenues(a, b) {
        const venueIdA = a.id;
        const venueIdB = b.id;
        
        if (venueIdA < venueIdB ) {
            return -1;
        } else { 
            return 1;
        }
    }

    function parseJSON(response){
        return response.json();
    }

    function fetchCall(url, method, data){
        return fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
    }
}