# Machine Learning Methodology

## Project Information
- **Project Title:** Students Performance Estimation System Using AI
- **Project Owner:** Nithyasri S
- **Academic Degree Demonstration:** MCA / B.Sc. Computer Science / Information Technology

---

## 1. Problem Formulation

Student academic performance estimation is formulated as a supervised multivariate regression task:

$$\hat{y} = f(\mathbf{x})$$

Where $\mathbf{x} \in \mathbb{R}^8$ represents eight continuous educational assessment indicators:
1. `attendance_percentage` ($x_1 \in [0, 100]$)
2. `internal_marks` ($x_2 \in [0, 100]$)
3. `assignment_score` ($x_3 \in [0, 100]$)
4. `practical_score` ($x_4 \in [0, 100]$)
5. `previous_semester_percentage` ($x_5 \in [0, 100]$)
6. `study_hours_per_week` ($x_6 \in [0, 80]$)
7. `assignment_completion_percentage` ($x_7 \in [0, 100]$)
8. `learning_activity_score` ($x_8 \in [0, 100]$)

The target variable $y \in [0, 100]$ represents the final examination score. In addition to numerical estimation, the system maps output scores into institutional performance bands:
- $\ge 80.0$: **Distinction** (Outstanding performance)
- $60.0 - 79.9$: **First Class** (Good academic standing)
- $45.0 - 59.9$: **Pass / Average** (Moderate monitoring recommended)
- $< 45.0$: **Needs Support** (High academic priority for faculty mentoring)

---

## 2. Dataset Synthesis & Validation

A documented synthetic educational dataset of **1,200 student records** was generated using realistic statistical distributions across five undergraduate departments:
- Computer Science
- Information Technology
- Computer Applications
- Software Engineering
- Artificial Intelligence & Data Science

### Summary Statistics of Dataset:
| Feature | Mean | Std Dev | Min | Max |
| :--- | :---: | :---: | :---: | :---: |
| Classroom Attendance % | 76.58 | 9.74 | 48.0 | 99.5 |
| Continuous Internal Marks | 72.24 | 15.04 | 25.0 | 99.0 |
| Practical / Lab Marks | 73.80 | 14.20 | 32.0 | 100.0 |
| Previous Semester % | 71.10 | 13.50 | 40.0 | 98.5 |
| Weekly Study Hours | 17.11 | 5.35 | 2.5 | 32.9 |
| Assignment Completion % | 78.40 | 12.10 | 35.0 | 100.0 |
| Final Examination Score | 73.02 | 14.14 | 31.9 | 99.5 |

---

## 3. Data Preprocessing & Validation Pipeline

1. **Missing Value Imputation:** Complete case verification during ingestion; numerical features are bounded between 0.0 and 100.0.
2. **Feature Standardization:** Features are zero-centered and scaled to unit variance using `StandardScaler`:
   $$z = \frac{x - \mu}{\sigma}$$
   The scaler parameters $(\mu, \sigma)$ are fitted strictly on the training partition ($N_{\text{train}} = 960$) to prevent data leakage.
3. **Train-Test Partition:** 80% Training ($N=960$) and 20% Held-Out Testing ($N=240$) with random seed 42.

---

## 4. Candidate Algorithms & Empirical Benchmark Results

Four candidate regression algorithms were trained and evaluated using 5-Fold Cross Validation:

| Algorithm | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | $R^2$ Score (Test) | 5-Fold CV $R^2$ (Mean $\pm$ Std) | Champion Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Linear Regression** | **2.696** | **3.374** | **0.9414** | **0.9423 $\pm$ 0.0108** | **Active Champion** |
| **Ridge Regression ($\alpha=1.0$)** | 2.695 | 3.374 | 0.9414 | 0.9423 $\pm$ 0.0108 | Candidate |
| **Gradient Boosting Regressor** | 2.890 | 3.576 | 0.9342 | 0.9366 $\pm$ 0.0107 | Candidate |
| **Random Forest Regressor** | 3.057 | 3.792 | 0.9260 | 0.9344 $\pm$ 0.0114 | Candidate |

### Evaluation Metrics Defined:
- **Mean Absolute Error (MAE):**
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$$
- **Root Mean Squared Error (RMSE):**
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$$
- **Coefficient of Determination ($R^2$):**
  $$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

---

## 5. Relative Feature Importance Breakdown

Feature weights normalized from the model pipeline:
- **Continuous Internal Marks:** **25.4%** (Primary driver of continuous mastery)
- **Weekly Self-Study Hours:** **18.4%** (Direct reflection of preparation discipline)
- **Practical & Lab Score:** **15.4%** (Experiential implementation capability)
- **Previous Semester Aggregate:** **14.4%** (Academic foundational continuity)
- **Assignment Quality Score:** **9.9%** (Homework and analytical writing)
- **Classroom Attendance:** **8.3%** (Lecture continuity and concept absorption)
- **Assignment Completion Rate:** **5.5%** (Consistency of submissions)
- **Learning Activity Score:** **2.7%** (LMS quizzes and lab forum participation)

---

## 6. Uncertainty Quantification & Prediction Interval

To communicate uncertainty responsibly, every estimation includes an empirical **90% Confidence Prediction Interval**:

$$\hat{y} \pm 1.645 \times \text{RSE}$$

Where $\text{RSE} \approx 3.374$ is the Residual Standard Error of the champion model. For an estimated score of $78.0$, the interval is reported as $[72.5, 83.5]$.

---

## 7. Explainability & Pedagogical Action Plans

Directional attribution compares each student feature against cohort mean baselines:
- **Positive Driver ($+5\%$ above baseline):** Acknowledges strong performance.
- **Negative Concern ($-5\%$ below baseline):** Flags specific weakness and attaches concrete remedial action steps.
- **Transparent Rule Engine:** Early warning indicators highlight attendance $<75\%$ (university detention risk) and internal marks $<50\%$ (assessment failure risk).
