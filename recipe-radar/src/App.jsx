import { useState, useEffect } from 'react';
import { Utensils, Search, X, Loader2, Moon, Sun, ChevronLeft, ChefHat, Heart } from 'lucide-react';
import './App.css';

function App() {
  // --- STATES ---
  const [ingredient, setIngredient] = useState("");
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("recipe-favs") || "[]")
  );

  const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

  // --- EFFECTS ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // --- LOGIC FUNCTIONS ---
  const addIngredient = (e) => {
    e.preventDefault();
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !pantry.includes(trimmed)) {
      setPantry([...pantry, trimmed]);
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
      alert("Error finding recipes. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
      );
      const data = await response.json();
      setSelectedRecipe(data);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Detail fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (e, recipe) => {
    e.stopPropagation(); // Prevents opening the detail view when clicking heart
    let updated;
    const isFav = favorites.some(fav => fav.id === recipe.id);
    if (isFav) {
      updated = favorites.filter(fav => fav.id !== recipe.id);
    } else {
      updated = [...favorites, recipe];
    }
    setFavorites(updated);
    localStorage.setItem("recipe-favs", JSON.stringify(updated));
  };

  const [isListening, setIsListening] = useState(false);

const handleVoiceSearch = () => {
  // Check if browser supports the API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("Your browser does not support voice search. Try Chrome!");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // Clean the voice input (remove periods, make lowercase)
    const voiceIngredient = transcript.replace(/\./g, '').toLowerCase();
    
    if (voiceIngredient && !pantry.includes(voiceIngredient)) {
      setPantry([...pantry, voiceIngredient]);
    }
    setIsListening(false);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};

  // --- RENDER: DETAIL VIEW ---
  if (selectedRecipe) {
    return (
      <div className="container detail-view">
        <button className="back-btn" onClick={() => setSelectedRecipe(null)}>
          <ChevronLeft size={20} /> Back to Results
        </button>
        
        <img src={selectedRecipe.image} alt={selectedRecipe.title} className="detail-img" />
        
        <div className="detail-header">
          <h1>{selectedRecipe.title}</h1>
          <div className="recipe-stats">
            <span>⏱️ {selectedRecipe.readyInMinutes} mins</span>
            <span>👥 Servings: {selectedRecipe.servings}</span>
          </div>
        </div>

        <div className="instructions-section">
          <h2>Instructions</h2>
          <div 
            className="instructions-text"
            dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions || "No instructions provided." }} 
          />
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN SEARCH VIEW ---
  return (
    <div className="container">
      <nav className="top-nav">
        <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </nav>

      <header>
        <div className="logo-icon">
          <Utensils size={40} color="#f97316" />
        </div>
        <h1>Recipe <span className="highlight">Radar</span></h1>
        <p>Your pantry, powered by AI.</p>
      </header>

      <form onSubmit={addIngredient} className="input-group">
        <input 
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="Add an ingredient (e.g. Eggs)..."
        />
        <button type="submit">Add</button>
      </form>

      <div className="pantry-list">
        {pantry.map(item => (
          <span key={item} className="tag">
            {item} 
            <X size={14} className="remove-icon" onClick={() => removeIngredient(item)} />
          </span>
        ))}
      </div>

      <button 
        className="search-btn" 
        onClick={findRecipes} 
        disabled={loading || pantry.length === 0}
      >
        {loading ? <Loader2 className="spin" /> : <><Search size={20} /> Find Recipes</>}
      </button>

      <div className="recipe-grid">
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card" onClick={() => fetchRecipeDetails(recipe.id)}>
            <div className="image-container">
              <img src={recipe.image} alt={recipe.title} />
              <button 
                className={`heart-btn ${favorites.some(f => f.id === recipe.id) ? 'active' : ''}`}
                onClick={(e) => toggleFavorite(e, recipe)}
              >
                <Heart size={18} fill={favorites.some(f => f.id === recipe.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="card-content">
              <h3>{recipe.title}</h3>
              <div className="card-footer">
                <span className="match-badge">
                  {recipe.usedIngredientCount} items matched
                </span>
                <ChefHat size={18} className="chef-icon" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {recipes.length === 0 && !loading && pantry.length === 0 && (
        <div className="empty-state">
          <p>Add ingredients above to start your search!</p>
        </div>
      )}
        {recipes.length === 0 && !loading && pantry.length > 0 && (
  <div className="no-results">
    <p>No recipes found with those exact ingredients. Try adding more basics like "oil" or "salt"!</p>
  </div>
)}
<form onSubmit={addIngredient} className="input-group">
  <input 
    value={ingredient}
    onChange={(e) => setIngredient(e.target.value)}
    placeholder="Add an ingredient (e.g. Eggs)..."
  />
  <button 
    type="button" 
    className={`voice-btn ${isListening ? 'listening' : ''}`} 
    onClick={handleVoiceSearch}
  >
    {isListening ? "Listening..." : "🎤"}
  </button>
  <button type="submit">Add</button>
</form>
      
    </div>
  );
}

export default App;