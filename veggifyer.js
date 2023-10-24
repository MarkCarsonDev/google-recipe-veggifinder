const isVegan = require('is-vegan');
const $ = require('jquery');

$(document).ready(function() {
    const recipeH3 = $("h3:contains('Recipes')").first();
    
    if (recipeH3.length == 0) return;

    getRecipes();

    // MutationObserver initialization
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if new nodes are added
            if (mutation.addedNodes.length) {
                getRecipes();
            }
        });
    });

    const parentContainer = document.body;
    
    observer.observe(parentContainer, { childList: true, subtree: true }); // Adding the 'subtree' option to observe descendants
});



function getRecipes() {
    // Initialize an array to store ingredients for each recipe
    let recipesWithIngredients = [];

    // Find all divs with aria-level="3", assuming they indicate recipe names
    const recipeNameDivs = document.querySelectorAll('div[aria-level="3"]');

    // Loop through all found divs to extract ingredients for each recipe
    recipeNameDivs.forEach(recipeNameDiv => {
        // Initialize an object to store the name and ingredients of each recipe
        let recipeObject = {
            recipe: recipeNameDiv,
            name: recipeNameDiv.textContent,
            ingredients: ""
        };

        // Navigate to the grandparent div of the recipe name div
        const grandParentDiv = recipeNameDiv.parentElement.parentElement;

        // Find the child div containing ingredients, which is two levels deeper than the grandparent div
        const ingredientsDiv = grandParentDiv.querySelector('div > div:nth-last-child(2)');

        // Check if the ingredientsDiv has text content
        if (ingredientsDiv && ingredientsDiv.textContent) {
            recipeObject.ingredients = ingredientsDiv.textContent;
        }

        recipesWithIngredients.push(recipeObject);
    });
    
    
    // Use async function to allow asynchronous API calls
    (async () => {
        // Loop through all found recipes to extract ingredients for each recipe
        for (const recipeObject of recipesWithIngredients) {
            // Skip if the ingredients are empty
            if (!recipeObject.ingredients) continue;
        
            // Split the ingredients by commas and convert to lowercase
            const ingredientsArray = recipeObject.ingredients.split(',').map(ingredient => ingredient.trim().toLowerCase());
            const cheese = ingredientsArray.some(ingredient => ingredient.includes('cheese') && !ingredient.includes('vegan'));
            const eggs = ingredientsArray.some(ingredient => (ingredient.includes('eggs') || ingredient.includes('egg')) && !ingredient.includes('vegan'));
            const vegan = await isVegan.isVeganIngredientList(ingredientsArray) && !cheese && !eggs

            // Edit the recipe card background color
            if (vegan) {
                recipeObject.recipe.parentElement.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
            } else {
                recipeObject.recipe.parentElement.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
            }
        }
    })();
}