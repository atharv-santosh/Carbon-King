"use client";
import React, { useState, useEffect } from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Image from 'next/image';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Your questions, levels, initialQuests, generateNewQuest — all unchanged
const completedQuests = ['quest1', 'quest3']; 

const questions = [
  {
    question: "How did you get to work/school today?",
    name: "transport",
    options: [
      { label: "Car", baseImpact: 0, impactPerKm: 0.404 },
      { label: "Bus", baseImpact: 0, impactPerKm: 0.101 },
      { label: "Bike", baseImpact: 0, impactPerKm: 0 },
      { label: "Walk", baseImpact: 0, impactPerKm: 0 },
      { label: "Train", baseImpact: 0, impactPerKm: 0.041 },
      { label: "Didn't go anywhere", baseImpact: 0, impactPerKm: 0 },
    ],
  },
  {
    question: "Did you eat vegetarian today?",
    name: "vegetarian",
    options: [
      { label: "Yes", impact: 0 },
      { label: "No", impact: 2.5 },
    ],
  },
  {
    question: "Did you recycle or donate electronics recently?",
    name: "eWaste",
    options: [
      { label: "Yes, recycled or donated", impactSavedPerCount: 0.5 },
      { label: "No", impactSavedPerCount: 0 },
    ],
  },
  {
    question: "Did you use energy-saving appliances today?",
    name: "energy",
    options: [
      { label: "Yes", impact: 0 },
      { label: "No", impact: 1.2 },
    ],
  },
  {
    question: "Did you avoid using single-use plastic today?",
    name: "plastic",
    options: [
      { label: "Yes", impact: 0 },
      { label: "No", impact: 0.3 },
    ],
  },
];

const levels = [
  { level: 1, xpNeeded: 0, label: "Seedling" },
  { level: 2, xpNeeded: 10, label: "Sprout" },
  { level: 3, xpNeeded: 25, label: "Young Plant" },
  { level: 4, xpNeeded: 50, label: "Mature Plant" },
  { level: 5, xpNeeded: 100, label: "Forest Guardian" },
  { level: 6, xpNeeded: 200, label: "Eco Warrior" },
  { level: 7, xpNeeded: 300, label: "Earth Protector" },
  { level: 8, xpNeeded: 500, label: "Climate Champion" },
];

const initialQuests = [
  {
    id: 1,
    description: "Bike 10 miles",
    progress: 0,
    target: 10,
    key: "bikeMiles",
    updateProgress: (formData, distanceMiles) => {
      if (formData.transport === "Bike") return distanceMiles;
      return 0;
    },
  },
  {
    id: 2,
    description: "Recycle 5 devices",
    progress: 0,
    target: 5,
    key: "recycledDevices",
    updateProgress: (formData, distanceMiles, eWasteRecycleCount) => {
      if (formData.eWaste === "Yes, recycled or donated") return eWasteRecycleCount;
      return 0;
    },
  },
];

function generateNewQuest(existingIds = []) {
  const possibleQuests = [
    {
      id: 3,
      description: "Walk 3 miles",
      progress: 0,
      target: 3,
      key: "walkMiles",
      updateProgress: (formData, distanceMiles) => {
        if (formData.transport === "Walk") return distanceMiles;
        return 0;
      },
    },
    {
      id: 4,
      description: "Use energy-saving appliances 3 times",
      progress: 0,
      target: 3,
      key: "energySaves",
      updateProgress: (formData) => {
        if (formData.energy === "Yes") return 1;
        return 0;
      },
    },
    {
      id: 5,
      description: "Avoid single-use plastic 5 days",
      progress: 0,
      target: 5,
      key: "plasticAvoided",
      updateProgress: (formData) => {
        if (formData.plastic === "Yes") return 1;
        return 0;
      },
    },
  ];

  const newQuest = possibleQuests.find((q) => !existingIds.includes(q.id));
  if (newQuest) return newQuest;

  return {
    id: 99,
    description: "Keep being sustainable!",
    progress: 0,
    target: 1,
    key: "default",
    updateProgress: () => 0,
  };
}

// Helper functions for cookies
function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}

function getCookie(name) {
  if (typeof document === "undefined") return null;
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null);
}

function calculateQuestionImpact(formData, distanceMiles, eWasteRecycleCount, vegetarianMeals) {
  const impacts = {
    transport: 0,
    vegetarian: 0,
    eWaste: 0,
    energy: 0,
    plastic: 0
  };

  // Calculate transport impact
  if (formData.transport) {
    let km = 0;
    if (["Bike", "Walk", "Bus", "Train"].includes(formData.transport) && distanceMiles > 0) {
      km = distanceMiles * 1.60934; // Convert miles to km
    }
    
    if (formData.transport === "Car") {
      impacts.transport = 0.404 * km;
    } else if (formData.transport === "Bus") {
      impacts.transport = 0.101 * km * 0.5;
    } else if (formData.transport === "Train") {
      impacts.transport = 0.041 * km * 0.3;
    }
  }

  // Calculate vegetarian impact
  if (formData.vegetarian === "Yes") {
    impacts.vegetarian = 2.5 * vegetarianMeals;
  }

  // Calculate e-waste impact
  if (formData.eWaste === "Yes, recycled or donated") {
    impacts.eWaste = 0.5 * eWasteRecycleCount;
  }

  // Calculate energy impact
  if (formData.energy === "Yes") {
    impacts.energy = 1.2;
  }

  // Calculate plastic impact
  if (formData.plastic === "Yes") {
    impacts.plastic = 0.3;
  }

  return impacts;
}

// Add this function to analyze the user's actions
function analyzeCarbonUsage(formData, carbonSaved) {
  const analysis = [];
  const suggestions = [];

  // Analyze transport
  if (formData.transport === "Car") {
    analysis.push("Consider using public transport or carpooling to reduce your carbon footprint.");
    suggestions.push("Try taking the bus or train next time!");
  } else if (formData.transport === "Bus" || formData.transport === "Train") {
    analysis.push("Great job using public transport!");
  } else if (formData.transport === "Bike" || formData.transport === "Walk") {
    analysis.push("Excellent choice! Walking or biking is the most eco-friendly option.");
  }

  // Analyze vegetarian meals
  if (formData.vegetarian === "Yes") {
    analysis.push("Eating vegetarian meals helps reduce your carbon footprint significantly!");
  } else {
    suggestions.push("Consider trying more vegetarian meals to reduce your carbon footprint.");
  }

  // Analyze e-waste
  if (formData.eWaste === "Yes, recycled or donated") {
    analysis.push("Great job recycling electronics! This helps prevent harmful e-waste.");
  } else {
    suggestions.push("Remember to recycle old electronics when possible.");
  }

  // Analyze energy usage
  if (formData.energy === "Yes") {
    analysis.push("Using energy-saving appliances is a great sustainable choice!");
  } else {
    suggestions.push("Try using energy-saving appliances to reduce your energy consumption.");
  }

  // Analyze plastic usage
  if (formData.plastic === "Yes") {
    analysis.push("Avoiding single-use plastic is excellent for the environment!");
  } else {
    suggestions.push("Try to reduce your use of single-use plastics.");
  }

  // Overall analysis
  if (carbonSaved > 5) {
    analysis.push("You're making a significant positive impact on the environment!");
  } else if (carbonSaved > 2) {
    analysis.push("Good effort! Keep up the sustainable practices.");
  } else {
    analysis.push("Every small action counts! Keep working on reducing your carbon footprint.");
  }

  return {
    analysis: analysis,
    suggestions: suggestions
  };
}

export default function SustainableActionTracker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [eWasteRecycleCount, setEWasteRecycleCount] = useState(1);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [carbonSaved, setCarbonSaved] = useState(null);
  const [vegetarianMeals, setVegetarianMeals] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  const [quests, setQuests] = useState(initialQuests);
  const [xpAnimation, setXpAnimation] = useState({ show: false, amount: 0 });
  const [fadeKey, setFadeKey] = useState(0);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage after component mounts
  useEffect(() => {
    setIsClient(true);
    
    try {
      // Load XP
      const savedXp = localStorage.getItem("totalXp");
      if (savedXp) setTotalXp(Number(savedXp));

      // Load Quests
      const savedQuests = localStorage.getItem("quests");
      if (savedQuests) setQuests(JSON.parse(savedQuests));

      // Load Daily Logs
      const savedLogs = localStorage.getItem("dailyLogs");
      if (savedLogs) setDailyLogs(JSON.parse(savedLogs));

      // Load Last Completed Date
      const savedLastDate = localStorage.getItem("lastCompletedDate");
      if (savedLastDate) setLastCompletedDate(savedLastDate);

      // Load form data from localStorage instead of cookies
      const savedFormData = localStorage.getItem("formData");
      const savedDistance = localStorage.getItem("distanceMiles");
      const savedEWasteCount = localStorage.getItem("eWasteRecycleCount");
      const savedVegetarianMeals = localStorage.getItem("vegetarianMeals");
      const savedCarbonSaved = localStorage.getItem("carbonSaved");
      const savedCurrentIndex = localStorage.getItem("currentIndex");

      if (savedFormData) setFormData(JSON.parse(savedFormData));
      if (savedDistance) setDistanceMiles(Number(savedDistance));
      if (savedEWasteCount) setEWasteRecycleCount(Number(savedEWasteCount));
      if (savedVegetarianMeals) setVegetarianMeals(Number(savedVegetarianMeals));
      if (savedCarbonSaved) setCarbonSaved(Number(savedCarbonSaved));
      if (savedCurrentIndex) setCurrentIndex(Number(savedCurrentIndex));
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("totalXp", totalXp.toString());
    }
  }, [totalXp, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("quests", JSON.stringify(quests));
    }
  }, [quests, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("dailyLogs", JSON.stringify(dailyLogs));
    }
  }, [dailyLogs, isLoading]);

  useEffect(() => {
    if (lastCompletedDate) {
      localStorage.setItem("lastCompletedDate", lastCompletedDate);
    }
  }, [lastCompletedDate]);

  // Add new useEffects to save form data to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("formData", JSON.stringify(formData));
    }
  }, [formData, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("distanceMiles", distanceMiles.toString());
    }
  }, [distanceMiles, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("eWasteRecycleCount", eWasteRecycleCount.toString());
    }
  }, [eWasteRecycleCount, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("vegetarianMeals", vegetarianMeals.toString());
    }
  }, [vegetarianMeals, isLoading]);

  // Animation states
  useEffect(() => {
    setFadeOpacity(0);
    const timeout = setTimeout(() => setFadeOpacity(1), 50);
    setFadeKey((k) => k + 1);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  // Add a new useEffect to save carbonSaved to localStorage
  useEffect(() => {
    if (!isLoading && carbonSaved !== null) {
      localStorage.setItem("carbonSaved", carbonSaved.toString());
    }
  }, [carbonSaved, isLoading]);

  // Add a new useEffect to handle the cooldown timer
  useEffect(() => {
    if (lastCompletedDate) {
      const timer = setInterval(() => {
        const now = new Date();
        const lastDate = new Date(lastCompletedDate);
        const diffInSeconds = (now - lastDate) / 1000;
        
        if (diffInSeconds >= 86400) {
          // Reset the state after cooldown
          setLastCompletedDate(null);
          localStorage.removeItem("lastCompletedDate");
          setCurrentIndex(0);
          setFormData({});
          setDistanceMiles(0);
          setEWasteRecycleCount(1);
          setVegetarianMeals(1);
          setCarbonSaved(null);
          
          // Clear localStorage
          localStorage.removeItem("formData");
          localStorage.removeItem("distanceMiles");
          localStorage.removeItem("eWasteRecycleCount");
          localStorage.removeItem("vegetarianMeals");
          localStorage.removeItem("carbonSaved");
          localStorage.removeItem("currentIndex");
          
          clearInterval(timer);
        }
      }, 1000); // Check every second

      return () => clearInterval(timer);
    }
  }, [lastCompletedDate]);

  function handleOptionSelect(option) {
    setFormData({ ...formData, [currentQuestion.name]: option });
    if (currentQuestion.name === "transport") setDistanceMiles(0);
    if (currentQuestion.name === "vegetarian") setVegetarianMeals(1);
  }

  function getImpact() {
    let carbonSaved = 0;

    const transportAnswer = formData.transport;
    if (transportAnswer) {
      const transportOption = questions[0].options.find(
        (o) => o.label === transportAnswer
      );
      let km = 0;
      if (["Bike", "Walk", "Bus", "Train"].includes(transportAnswer) && distanceMiles > 0) {
        km = distanceMiles * 1.60934; // Convert miles to km
      }
      
      // Calculate carbon saved based on transport choice
      if (transportAnswer === "Car") {
        // Car emits 404g CO2 per km
        carbonSaved += 0.404 * km;
      } else if (transportAnswer === "Bus") {
        // Bus emits 101g CO2 per km per passenger
        // Reduce the impact by 50% to balance XP
        carbonSaved += 0.101 * km * 0.5;
      } else if (transportAnswer === "Train") {
        // Train emits 41g CO2 per km per passenger
        // Reduce the impact by 70% to balance XP
        carbonSaved += 0.041 * km * 0.3;
      }
      // Bike and Walk have 0 emissions
    }

    // Calculate carbon saved from food choices
    if (formData.vegetarian === "Yes") {
      // Each meat meal avoided saves 2.5kg CO2
      carbonSaved += 2.5 * vegetarianMeals;
    }

    // Calculate carbon saved from e-waste recycling
    if (formData.eWaste === "Yes, recycled or donated") {
      // Each device recycled saves 0.5kg CO2
      carbonSaved += 0.5 * eWasteRecycleCount;
    }

    // Calculate carbon saved from energy usage
    if (formData.energy === "Yes") {
      // Using energy-saving appliances saves 1.2kg CO2 per day
      carbonSaved += 1.2;
    }

    // Calculate carbon saved from plastic usage
    if (formData.plastic === "Yes") {
      // Avoiding single-use plastic saves 0.3kg CO2 per day
      carbonSaved += 0.3;
    }

    return Math.max(0, carbonSaved);
  }

  function updateQuests() {
    setQuests(prevQuests => {
      // First update progress for all quests
      const updatedQuests = prevQuests.map(quest => {
        if (quest.completed) return quest;

        let progress = quest.progress;
        
        // Update progress based on the action type
        if (quest.key === "bikeMiles" && formData.transport === "Bike") {
          progress = Math.min(quest.target, progress + distanceMiles);
        } else if (quest.key === "recycledDevices" && formData.eWaste === "Yes, recycled or donated") {
          progress = Math.min(quest.target, progress + eWasteRecycleCount);
        } else if (quest.key === "walkMiles" && formData.transport === "Walk") {
          progress = Math.min(quest.target, progress + distanceMiles);
        } else if (quest.key === "energySaves" && formData.energy === "Yes") {
          progress = Math.min(quest.target, progress + 1);
        } else if (quest.key === "plasticAvoided" && formData.plastic === "Yes") {
          progress = Math.min(quest.target, progress + 1);
        }

        const completed = progress >= quest.target;
        if (completed) {
          const xpGained = Math.floor(quest.target * 2);
          setTotalXp(prevXp => {
            const newXp = prevXp + xpGained;
            localStorage.setItem("totalXp", newXp.toString());
            return newXp;
          });
        }

        return { ...quest, progress, completed };
      });

      // Remove completed quests and add new ones
      const activeQuests = updatedQuests.filter(q => !q.completed);
      const completedQuests = updatedQuests.filter(q => q.completed);
      
      // If we have completed quests, remove them and add new ones
      if (completedQuests.length > 0) {
        const existingIds = activeQuests.map(q => q.id);
        const newQuest = generateNewQuest(existingIds);
        return [...activeQuests, newQuest];
      }

      return activeQuests;
    });
  }

  function canSubmitToday() {
    if (!lastCompletedDate) return true;
    const now = new Date();
    const lastDate = new Date(lastCompletedDate);
    const diffInSeconds = (now - lastDate) / 1000;
    return diffInSeconds >= 86400; // Changed to 24 hours (86400 seconds)
  }

  function handleNext() {
    if (!formData[currentQuestion.name]) {
      return alert("Please select an option.");
    }
    if (
      currentQuestion.name === "transport" &&
      ["Bike", "Walk", "Bus", "Train"].includes(formData.transport) &&
      (distanceMiles === 0 || distanceMiles === null)
    ) {
      return alert("Please enter how many miles you traveled.");
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!canSubmitToday()) {
        return alert("You've already completed today's log. Come back tomorrow!");
      }

      const saved = getImpact();
      setCarbonSaved(saved);
      
      // Calculate XP with more balanced multipliers
      let xpGained = 0;
      
      // Calculate XP for each action type
      if (formData.transport === "Bus" || formData.transport === "Train") {
        // 2x multiplier for public transport
        xpGained += Math.floor(saved * 2);
      } else if (formData.eWaste === "Yes, recycled or donated") {
        // 5x multiplier for recycling
        xpGained += Math.floor(saved * 5);
      } else if (formData.energy === "Yes") {
        // 4x multiplier for energy saving
        xpGained += Math.floor(saved * 4);
      } else if (formData.plastic === "Yes") {
        // 3x multiplier for plastic reduction
        xpGained += Math.floor(saved * 3);
      } else {
        // Normal XP for other actions
        xpGained += Math.floor(saved * 1.5);
      }
      
      // Update totalXp
      setTotalXp(prevXp => {
        const newXp = prevXp + xpGained;
        localStorage.setItem("totalXp", newXp.toString());
        return newXp;
      });
      
      // Create new daily log
      const newLog = {
        date: new Date().toDateString(),
        carbonSaved: saved,
        xpGained: xpGained,
        totalXp: totalXp + xpGained,
        level: getLevelProgress().currentLevel,
        actions: {
          ...formData,
          distanceMiles,
          eWasteRecycleCount,
          vegetarianMeals
        }
      };
      
      setDailyLogs(prev => [...prev, newLog]);
      
      // Start the cooldown after submission
      const now = new Date();
      setLastCompletedDate(now.toISOString());
      localStorage.setItem("lastCompletedDate", now.toISOString());
      
      // Trigger the animation
      setXpAnimation({ show: true, amount: xpGained });
      setTimeout(() => setXpAnimation({ show: false, amount: 0 }), 2000);

      updateQuests();
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function handleResetCooldown() {
    // Reset cooldown
    setLastCompletedDate(null);
    localStorage.removeItem("lastCompletedDate");
    
    // Reset form data and index
    setCurrentIndex(0);
    setFormData({});
    setDistanceMiles(0);
    setEWasteRecycleCount(1);
    setVegetarianMeals(1);
    setCarbonSaved(null);

    // Clear localStorage
    localStorage.removeItem("formData");
    localStorage.removeItem("distanceMiles");
    localStorage.removeItem("eWasteRecycleCount");
    localStorage.removeItem("vegetarianMeals");
    localStorage.removeItem("carbonSaved");
    localStorage.removeItem("currentIndex");
  }

  function handleNextDay() {
    const now = new Date();
    setLastCompletedDate(now.toISOString());
    localStorage.setItem("lastCompletedDate", now.toISOString());
  }

  function getLevelProgress() {
    // If no XP, return first level with 0% progress
    if (totalXp <= 0) {
      return { 
        currentLevel: levels[0], 
        progress: 0, 
        xpForCurrentLevel: 0,
        xpForNextLevel: levels[1].xpNeeded 
      };
    }

    // Find current level
    const currentLevel = levels.reduce((acc, level) => {
      return totalXp >= level.xpNeeded ? level : acc;
    }, levels[0]);

    // Find next level
    const nextLevel = levels.find(level => level.xpNeeded > currentLevel.xpNeeded) || currentLevel;

    // Calculate progress
    const xpForCurrentLevel = totalXp - currentLevel.xpNeeded;
    const xpForNextLevel = nextLevel.xpNeeded - currentLevel.xpNeeded;
    const progress = nextLevel === currentLevel 
      ? 100 
      : (xpForCurrentLevel / xpForNextLevel) * 100;

    return {
      currentLevel,
      nextLevel,
      progress,
      xpForCurrentLevel,
      xpForNextLevel
    };
  }

  const currentQuestion = questions[currentIndex];

  const { currentLevel, nextLevel, progress, xpForCurrentLevel, xpForNextLevel } = getLevelProgress();

  // Add this CSS animation to your component's style section
  const xpAnimationStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
    animation: 'floatUp 2s ease-out',
    zIndex: 1000,
    pointerEvents: 'none',
  };

  // Modify the return statement to show loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#e9fbe5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#e9fbe5",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Add the logo */}
      <div style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
      }}>
        <Image
          src="/carbonKingLogo.png"
          alt="Carbon King Logo"
          width={150}
          height={150}
          style={{
            objectFit: "contain",
          }}
        />
      </div>

      {/* Left sidebar: Quests */}
      <div
        style={{
          width: 260,
          backgroundColor: "#c9f4c5",
          padding: 20,
          borderRight: "2px solid #82d173",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          color: "#064006",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Quests</h2>
        {isClient && quests.map((quest) => (
          <div
            key={quest.id}
            style={{
              backgroundColor: "#d9f8d9",
              padding: 12,
              borderRadius: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "background-color 0.3s ease",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>{quest.description}</p>
            <div
              style={{
                height: 10,
                backgroundColor: "#a0d7a1",
                borderRadius: 6,
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: `${(quest.progress / quest.target) * 100}%`,
                  height: "100%",
                  backgroundColor: "#4caf50",
                  borderRadius: 6,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <small>
              {Math.floor(quest.progress)} / {quest.target}
            </small>
          </div>
        ))}
        {isClient && (
          <div style={{ marginTop: 20, padding: 15, backgroundColor: "#d9f8d9", borderRadius: 10 }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#064006" }}>Level Progress</h3>
            {(() => {
              const { currentLevel, nextLevel, progress, xpForCurrentLevel, xpForNextLevel } = getLevelProgress();
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span>Level {currentLevel.level}: {currentLevel.label}</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <div style={{
                    height: 15,
                    backgroundColor: "#a0d7a1",
                    borderRadius: 8,
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: "100%",
                      backgroundColor: "#4caf50",
                      borderRadius: 8,
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                  <div style={{ marginTop: 5, fontSize: "0.9em", color: "#064006" }}>
                    {xpForCurrentLevel} / {xpForNextLevel} XP to next level
                  </div>
                  <div style={{ marginTop: 5, fontSize: "0.9em", color: "#064006" }}>
                    Total XP: {totalXp}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Right side: Quiz & results */}
      <div
        style={{
          flex: 1,
          padding: 20,
          maxWidth: 480,
          margin: "auto",
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        {isClient && !lastCompletedDate ? (
          <div
            key={fadeKey}
            style={{
              opacity: fadeOpacity,
              transition: "opacity 0.3s ease",
            }}
          >
            <h2 style={{ color: "#000000" }}>{currentQuestion.question}</h2>

            <div style={{ marginTop: 20 }}>
              {currentQuestion.options.map((opt) => (
                <div key={opt.label} style={{ marginBottom: 12 }}>
                  <button
                    onClick={() => handleOptionSelect(opt.label)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor:
                        formData[currentQuestion.name] === opt.label
                          ? "#82d173"
                          : "#f0f0f0",
                      border: "1px solid #ccc",
                      borderRadius: 8,
                      cursor: "pointer",
                      textAlign: "left",
                      color:
                        formData[currentQuestion.name] === opt.label
                          ? "white"
                          : "#000000",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                </div>
              ))}
            </div>

            {currentQuestion.name === "transport" &&
              ["Bike", "Walk", "Bus", "Train"].includes(formData.transport) && (
                <div style={{ marginTop: 20 }}>
                  <label style={{ color: "#000000" }}>
                    How many miles did you {formData.transport.toLowerCase()}?{" "}
                    {distanceMiles} mi
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={["Bus", "Train"].includes(formData.transport) ? "1000" : "100"}
                    value={distanceMiles}
                    onChange={(e) => setDistanceMiles(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              )}

            {currentQuestion.name === "vegetarian" &&
              formData.vegetarian === "Yes" && (
                <div style={{ marginTop: 20 }}>
                  <label>Number of vegetarian meals today: {vegetarianMeals}</label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={vegetarianMeals}
                    onChange={(e) => setVegetarianMeals(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              )}

            {currentQuestion.name === "eWaste" &&
              formData.eWaste === "Yes, recycled or donated" && (
                <div style={{ marginTop: 20 }}>
                  <label>Number of devices recycled: {eWasteRecycleCount}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={eWasteRecycleCount}
                    onChange={(e) => setEWasteRecycleCount(+e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              )}

            <div
              style={{
                marginTop: 30,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                style={{
                  backgroundColor: currentIndex === 0 ? "#ccc" : "#4caf50",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: currentIndex === 0 ? "default" : "pointer",
                  transition: "background-color 0.3s ease",
                }}
              >
                ← Back
              </button>

              <button
                onClick={handleNext}
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
              >
                {currentIndex === questions.length - 1 ? "Submit" : "Next →"}
              </button>
            </div>
          </div>
        ) : isClient && (
          <div
            key="result"
            style={{
              opacity: fadeOpacity,
              transition: "opacity 0.5s ease",
              color: "#000000"
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: "#000000", margin: 0 }}>You saved {carbonSaved?.toFixed(2) || "0.00"} kg of CO₂ today!</h2>
              <button
                onClick={handleResetCooldown}
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
              >
                Reset Cooldown
              </button>
            </div>
            <p style={{ fontSize: 18, marginTop: 10, color: "#000000" }}>
              Level: <strong>{currentLevel.label}</strong>
            </p>
            <p style={{ fontSize: 16, marginTop: 10, color: "#000000" }}>
               It would take approximately{" "}
              <strong>{Math.ceil(carbonSaved / 0.057)}</strong> tree
              {carbonSaved / 0.057 > 1 ? "s" : ""} absorbing CO₂ for one day to
              match this!
            </p>

            {/* Add Daily Logs Section */}
            <div style={{ marginTop: 30 }}>
              <h3 style={{ color: "#000000" }}>Your Daily Logs</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {dailyLogs.slice().reverse().map((log, index) => (
                  <div 
                    key={index}
              style={{
                      padding: "10px",
                      margin: "5px 0",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "5px"
                    }}
                  >
                    <p style={{ margin: 0, color: "#000000" }}>
                      <strong>{log.date}</strong> - Saved {log.carbonSaved.toFixed(2)} kg CO₂
                      <br />
                      Level: {log.level.label} (XP: {log.totalXp})
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {carbonSaved !== null && (
              <div style={{ 
                marginTop: 30,
                maxWidth: '600px', 
                margin: '30px auto',
                height: '300px'
              }}>
                <h3 style={{ color: "#000000", marginBottom: '20px' }}>Your Carbon Savings Breakdown</h3>
                <div style={{ height: '250px' }}>
                  <Bar
                    data={{
                      labels: ['Transport', 'Vegetarian Meals', 'E-Waste', 'Energy', 'Plastic'],
                      datasets: [{
                        label: 'Carbon Saved (kg)',
                        data: Object.values(calculateQuestionImpact(
                          formData,
                          distanceMiles,
                          eWasteRecycleCount,
                          vegetarianMeals
                        )),
                        backgroundColor: 'rgba(76, 175, 80, 0.8)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false
                        },
                        title: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Carbon Saved: ${context.raw.toFixed(2)} kg`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Carbon Saved (kg)'
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '10px', 
                  padding: '0 10px',
                  color: '#000000'
                }}>
                  <p>Total Carbon Saved: {carbonSaved.toFixed(2)} kg</p>
                  <p>Date: {new Date().toDateString()}</p>
                </div>
              </div>
            )}

            {carbonSaved !== null && (
              <div style={{ marginTop: 20, padding: 15, backgroundColor: "#f5f5f5", borderRadius: 10 }}>
                <h3 style={{ color: "#064006", marginBottom: 10 }}>Analysis</h3>
                {(() => {
                  const { analysis, suggestions } = analyzeCarbonUsage(formData, carbonSaved);
                  return (
                    <>
                      <div style={{ marginBottom: 15 }}>
                        <h4 style={{ color: "#064006", marginBottom: 5 }}>What You Did Well:</h4>
                        {analysis.map((item, index) => (
                          <p key={index} style={{ color: "#064006", margin: "5px 0" }}>✓ {item}</p>
                        ))}
                      </div>
                      {suggestions.length > 0 && (
                        <div>
                          <h4 style={{ color: "#064006", marginBottom: 5 }}>Suggestions for Improvement:</h4>
                          {suggestions.map((item, index) => (
                            <p key={index} style={{ color: "#064006", margin: "5px 0" }}>💡 {item}</p>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* XP Animation */}
      {isClient && xpAnimation.show && (
        <div style={xpAnimationStyle}>
          +{xpAnimation.amount} XP
        </div>
      )}

      {/* Add this style tag in your component's return statement */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
        }
      `}</style>
    </div>
  );
}