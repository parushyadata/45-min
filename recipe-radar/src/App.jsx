import { useState } from 'react';
import { X, Search, Utensils, Loader2, ChefHat } from 'lucide-react';

function App() {
  // Input and Pantry States
  const [ingredient, setIngredient] = useState("");
  const [pantry, setPantry] = useState([]);
  
  // API and UI States
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

  // Logic: Add ingredient to the list
  const addIngredient = (e) => {
    e.preventDefault();
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !pantry.includes(trimmed)) {
      setPantry([...pantry, trimmed]);
      setIngredient(""); 
    }
  };

  // Logic: Remove ingredient from the list
  const removeIngredient = (itemToRemove) => {
    setPantry(pantry.filter(item => item !== itemToRemove));
  };

  // Logic: Fetch recipes from Spoonacular
  const searchRecipes = async () => {
    if (pantry.length === 0) return;
    
    setLoading(true);
    try {
      const ingredientQuery = pantry.join(",");
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientQuery}&number=6&ranking=1&apiKey=${API_KEY}`
      );
      
      if (!response.ok) throw new Error("API Limit reached or invalid key");
      
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes. Please check your console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
            <Utensils size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Recipe <span className="text-orange-500">Radar</span>
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          Turn your available ingredients into delicious meals.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Ingredient Input Card */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={addIngredient} className="flex gap-2 mb-6">
            <input 
              type="text"
              className="flex-1 p-4 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-all"
              placeholder="What's in your fridge? (e.g. Eggs, Milk, Kale)"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
            />
            <button className="bg-orange-500 text-white px-8 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-100">
              Add
            </button>
          </form>

          {/* Pantry Tags */}
          <div className="flex flex-wrap gap-2">
            {pantry.length === 0 && (
              <p className="text-gray-400 italic text-sm">Your pantry is empty...</p>
            )}
            {pantry.map((item) => (
              <span 
                key={item} 
                className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-orange-100 animate-in fade-in zoom-in duration-200"
              >
                <span className="capitalize font-medium">{item}</span>
                <button 
                  onClick={() => removeIngredient(item)}
                  className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={16} />
                </button>
              </span>
            ))}
          </div>

          {/* Search Button */}
          {pantry.length > 0 && (
            <button 
              onClick={searchRecipes}
              disabled={loading}
              className="w-full mt-8 bg-gray-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <><Search size={20} /> Find Matching Recipes</>
              )}
            </button>
          )}
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                    {recipe.usedIngredientCount} / {recipe.usedIngredientCount + recipe.missedIngredientCount} Match
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  
                  <div className="mt-auto pt-4">
                    <button 
                      onClick={() => window.open(`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`, '_blank')}
                      className="w-full bg-orange-50 text-orange-600 py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <ChefHat size={18} /> View Method
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : !loading && pantry.length > 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
               Click "Find Matching Recipes" to see results!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;