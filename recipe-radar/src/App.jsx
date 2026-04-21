import { useState } from 'react';
import { Utensils, Search, X, Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [ingredient, setIngredient] = useState("");
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

  const addIngredient = (e) => {
    e.preventDefault();
    if (ingredient.trim() && !pantry.includes(ingredient.toLowerCase())) {
      setPantry([...pantry, ingredient.toLowerCase()]);
      setIngredient("");
    }
  };

  const removeIngredient = (item) => {
    setPantry(pantry.filter((i) => i !== item));
  };

  const findRecipes = async () => {
    if (pantry.length === 0) return;
    setLoading(true);
    try {
      const query = pantry.join(",");
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=6&apiKey=${API_KEY}`
      );
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <Utensils color="#f97316" size={40} />
        <h1>Recipe Radar</h1>
        <p>Enter ingredients to find meals</p>
      </header>

      <form onSubmit={addIngredient} className="input-group">
        <input 
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="e.g. Tomato, Chicken..."
        />
        <button type="submit">Add</button>
      </form>

      <div className="pantry-list">
        {pantry.map(item => (
          <span key={item} className="tag">
            {item} <X size={14} onClick={() => removeIngredient(item)} />
          </span>
        ))}
      </div>

      <button 
        className="search-btn" 
        onClick={findRecipes} 
        disabled={loading || pantry.length === 0}
      >
        {loading ? <Loader2 className="spin" /> : "Find Recipes"}
      </button>

      <div className="recipe-grid">
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.title} />
            <h3>{recipe.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;