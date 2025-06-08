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

  // Load data from localStorage after component mounts
  useEffect(() => {
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

    // Load other saved data
    const savedFormData = getCookie("formData");
    const savedDistance = getCookie("distanceMiles");
    const savedEWasteCount = getCookie("eWasteRecycleCount");
    const savedVegetarianMeals = getCookie("vegetarianMeals");
    const savedCarbonSaved = getCookie("carbonSaved");
    const savedCurrentIndex = getCookie("currentIndex");

    if (savedFormData) setFormData(JSON.parse(savedFormData));
    if (savedDistance) setDistanceMiles(Number(savedDistance));
    if (savedEWasteCount) setEWasteRecycleCount(Number(savedEWasteCount));
    if (savedVegetarianMeals) setVegetarianMeals(Number(savedVegetarianMeals));
    if (savedCarbonSaved) setCarbonSaved(Number(savedCarbonSaved));
    if (savedCurrentIndex) setCurrentIndex(Number(savedCurrentIndex));
  }, []); // Empty dependency array means this runs once on mount

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("totalXp", totalXp.toString());
  }, [totalXp]);

  useEffect(() => {
    localStorage.setItem("quests", JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem("dailyLogs", JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    if (lastCompletedDate) {
      localStorage.setItem("lastCompletedDate", lastCompletedDate);
    }
  }, [lastCompletedDate]);

  // Save formData, distance, counts, current index, carbonSaved to cookies on change
  useEffect(() => {
    setCookie("formData", JSON.stringify(formData));
    setCookie("distanceMiles", distanceMiles.toString());
    setCookie("eWasteRecycleCount", eWasteRecycleCount.toString());
    setCookie("vegetarianMeals", vegetarianMeals.toString());
    setCookie("carbonSaved", carbonSaved !== null ? carbonSaved.toString() : "");
    setCookie("currentIndex", currentIndex.toString());
  }, [formData, distanceMiles, eWasteRecycleCount, vegetarianMeals, carbonSaved, currentIndex]);

  // Animation states
  useEffect(() => {
    setFadeOpacity(0);
    const timeout = setTimeout(() => setFadeOpacity(1), 50);
    setFadeKey((k) => k + 1);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

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
    setQuests((oldQuests) => {
      const updatedQuests = oldQuests.map((quest) => {
        // Get the current progress increment
        let progressIncrement = 0;
        
        // Calculate progress based on quest type
        if (quest.key === "bikeMiles" && formData.transport === "Bike") {
          progressIncrement = distanceMiles;
        } else if (quest.key === "walkMiles" && formData.transport === "Walk") {
          progressIncrement = distanceMiles;
        } else if (quest.key === "recycledDevices" && formData.eWaste === "Yes, recycled or donated") {
          progressIncrement = eWasteRecycleCount;
        } else if (quest.key === "energySaves" && formData.energy === "Yes") {
          progressIncrement = 1;
        } else if (quest.key === "plasticAvoided" && formData.plastic === "Yes") {
          progressIncrement = 1;
        }
        
        // Add to existing progress, but don't exceed target
        const newProgress = Math.min(quest.target, quest.progress + progressIncrement);
        
        return { ...quest, progress: newProgress };
      });

      // Check for completed quests
      const completedIndices = updatedQuests
        .map((quest, idx) => quest.progress >= quest.target ? idx : -1)
        .filter(idx => idx !== -1);

      // Replace completed quests with new ones
      if (completedIndices.length > 0) {
        const existingIds = updatedQuests.map(q => q.id);
        completedIndices.forEach(idx => {
          const newQuest = generateNewQuest(existingIds);
          updatedQuests[idx] = newQuest;
        });
      }

      // Save to localStorage
      localStorage.setItem("quests", JSON.stringify(updatedQuests));
      return updatedQuests;
    });
  }

  function canSubmitToday() {
    if (!lastCompletedDate) return true;
    const today = new Date().toDateString();
    return lastCompletedDate !== today;
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
      const xpGained = Math.floor(saved * 2);
      
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
      setLastCompletedDate(new Date().toDateString());
      
      // Trigger the animation
      setXpAnimation({ show: true, amount: xpGained });
      setTimeout(() => setXpAnimation({ show: false, amount: 0 }), 2000);
      
      updateQuests();
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setFormData({});
    setDistanceMiles(0);
    setEWasteRecycleCount(1);
    setVegetarianMeals(1);
    setCarbonSaved(null);

    // Clear cookies on restart
    setCookie("formData", "", -1);
    setCookie("distanceMiles", "", -1);
    setCookie("eWasteRecycleCount", "", -1);
    setCookie("vegetarianMeals", "", -1);
    setCookie("carbonSaved", "", -1);
    setCookie("currentIndex", "", -1);
  }

  function handleNextDay() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setLastCompletedDate(tomorrow.toDateString());
    localStorage.setItem("lastCompletedDate", tomorrow.toDateString());
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#e9fbe5",
        display: "flex",
        fontFamily: "Arial, sans-serif",
      }}
    >
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
        {quests.map((quest) => (
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
        <div style={{ marginTop: 20, padding: 15, backgroundColor: "#d9f8d9", borderRadius: 10 }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#064006" }}>Level Progress</h3>
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
        </div>
        <button
          onClick={handleNextDay}
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            width: "100%",
            marginTop: "10px"
          }}
        >
          Next Day
        </button>
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
        {carbonSaved === null ? (
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
        ) : (
          <div
            key="result"
            style={{
              opacity: fadeOpacity,
              transition: "opacity 0.5s ease",
              color: "#000000"
            }}
          >
            <h2 style={{ color: "#000000" }}>You saved {carbonSaved.toFixed(2)} kg of CO₂ today!</h2>
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

            <div style={{ marginTop: 30, display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRestart}
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
                Restart
              </button>
              <button
                onClick={handleNextDay}
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
                Next Day
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add this to your component's return statement, just before the closing div */}
      {xpAnimation.show && (
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