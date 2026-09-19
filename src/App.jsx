import React, { useState } from 'react';
import { Upload, FileText, BarChart2, Hash, Type, Users, Sparkles } from 'lucide-react';
import { parseRenpyScript } from './utils/parser';

const VisualAnalytics = ({ stats }) => {
  if (!stats || stats.length === 0) return null;

  const totalLines = stats.reduce((acc, char) => acc + char.lineCount, 0);
  const totalWords = stats.reduce((acc, char) => acc + char.wordCount, 0);
  const avgWordsPerLine = (totalWords / totalLines).toFixed(1);

  const topCharactersByWords = [...stats].sort((a, b) => b.wordCount - a.wordCount).slice(0, 5);
  const topCharactersByLines = [...stats].sort((a, b) => b.lineCount - a.lineCount).slice(0, 10);

  let cumulativePercent = 0;
  const pieColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899'];

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const pieSlices = topCharactersByWords.map((char, i) => {
    const percent = char.wordCount / totalWords;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'L 0 0',
    ].join(' ');

    return { pathData, color: pieColors[i % pieColors.length], name: char.name, percent: (percent * 100).toFixed(1) };
  });

  return (
    <div className="analytics-dashboard">
      <div className="card">
        <h3 className="section-title">
          <Sparkles size={20} className="icon-primary" />
          Script Metrics
        </h3>

        <div className="kpi-grid">
          <div className="card kpi-card">
            <p className="stat-label">Total Words</p>
            <p className="stat-value-large">{totalWords.toLocaleString()}</p>
          </div>
          <div className="card kpi-card">
            <p className="stat-label">Total Lines</p>
            <p className="stat-value-large">{totalLines.toLocaleString()}</p>
          </div>
          <div className="card kpi-card">
            <p className="stat-label">Avg Words / Line</p>
            <p className="stat-value-large">{avgWordsPerLine}</p>
          </div>
        </div>

        <div className="bar-chart">
          <p className="stat-label">Line Count Comparison</p>
          {topCharactersByLines.map((char) => (
            <div key={char.name} className="bar-row">
              <div className="bar-label-group">
                <span className="bar-char-name">{char.name}</span>
                <span className="bar-char-lines">{char.lineCount} lines</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(char.lineCount / topCharactersByLines[0].lineCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card chart-card">
        <h3 className="section-title">Dialogue Share</h3>
        <div className="chart-container">
          <svg viewBox="-1.1 -1.1 2.2 2.2" className="pie-chart-svg">
            {pieSlices.map((slice) => (
              <path
                key={slice.name}
                d={slice.pathData}
                fill={slice.color}
                className="pie-segment"
              />
            ))}
          </svg>
        </div>
        <div className="chart-legend">
          {pieSlices.map((slice) => (
            <div key={slice.name} className="legend-item">
              <div className="legend-color" style={{ background: slice.color }}></div>
              <span>{slice.name} ({slice.percent}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [scriptText, setScriptText] = useState('');
  const [characterStats, setCharacterStats] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setScriptText(text);
        setCharacterStats(parseRenpyScript(text));
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setScriptText(text);
    if (text.trim()) {
      setCharacterStats(parseRenpyScript(text));
    } else {
      setCharacterStats(null);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Ren'Py Script Analyzer</h1>
        <p className="app-subtitle">
          Analyze lines and word distribution for Ren'Py scripts.
        </p>
      </header>

      <div className="card input-section">
        <div className="input-split">
          <div className="input-half">
            <h2 className="input-title">
              <Upload size={20} className="icon-primary" />
              Upload Script
            </h2>
            <label className="upload-zone">
              <input type="file" accept=".rpy" onChange={handleFileUpload} className="hidden-input" />
              <FileText size={40} className="upload-icon" />
              <p className="upload-text">Click or drag to select .rpy file</p>
              <p className="upload-subtext">Supports Ren'Py script files</p>
            </label>
          </div>

          <div className="input-half">
            <h2 className="input-title">
              <Type size={20} className="icon-secondary" />
              Paste Script
            </h2>
            <textarea
              className="text-area"
              placeholder={'define e = Character("Eileen")\ne "Welcome to our story!"'}
              onChange={handleTextChange}
              value={scriptText}
            />
          </div>
        </div>
      </div>

      {characterStats && (
        <>
          <VisualAnalytics stats={characterStats} />

          <div className="character-breakdown-section">
            <div className="breakdown-header">
              <h2 className="section-title-large">
                <BarChart2 size={28} className="icon-primary" />
                Character Breakdown
              </h2>
              <div className="badge">
                <Users size={16} className="badge-icon" />
                {characterStats.length} Characters
              </div>
            </div>

            <div className="stats-grid">
              {[...characterStats].sort((a, b) => b.lineCount - a.lineCount).map((char) => (
                <div key={char.name} className="card stat-card">
                  <h3 className="char-name">{char.name}</h3>
                  <div className="char-stats">
                    <div className="stat-group">
                      <p className="stat-label">Lines</p>
                      <p className="stat-value">
                        <Hash size={16} className="stat-icon" />
                        {char.lineCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="stat-group">
                      <p className="stat-label">Words</p>
                      <p className="stat-value stat-value-secondary">
                        <Type size={16} className="stat-icon" />
                        {char.wordCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
