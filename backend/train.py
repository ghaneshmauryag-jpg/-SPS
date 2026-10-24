"""
Standalone Model Training and Evaluation Script for College Presentation.
Usage:
    python train.py
"""

from ml_engine import AcademicMLService

def main():
    print("=" * 65)
    print("🎓 SPS: Student Performance Prediction System (College Project)")
    print("   Machine Learning Model Training & Comparative Evaluation")
    print("=" * 65)
    
    service = AcademicMLService()
    print("\n⏳ Training Linear Regression & Random Forest Regressor...")
    metrics = service.train_and_evaluate(seed=42)
    
    print("\n✅ Training Complete!")
    print("\n--- MODEL PERFORMANCE COMPARISON ---")
    print(f"{'Metric':<10} | {'Linear Regression (Baseline)':<28} | {'Random Forest Regressor (Main)':<30}")
    print("-" * 75)
    
    lr = metrics["linear_regression"]
    rf = metrics["random_forest"]
    
    print(f"{'MAE':<10} | {lr['mae']:<28} | {rf['mae']:<30}")
    print(f"{'RMSE':<10} | {lr['rmse']:<28} | {rf['rmse']:<30}")
    print(f"{'R² Score':<10} | {lr['r2']:<28} | {rf['r2']:<30}")
    print(f"{'Samples':<10} | Train: {lr['samples_train']}, Test: {lr['samples_test']:<12} | Train: {rf['samples_train']}, Test: {rf['samples_test']}")
    print("-" * 75)
    print(f"🏆 Best Model Selected: {metrics['selected_model']}")
    
    print("\n--- FEATURE IMPORTANCES (Random Forest) ---")
    for feat in metrics["feature_importances"]:
        bar = "█" * int(feat["importance_pct"] / 2.5)
        print(f" - {feat['feature']:<32} : {feat['importance_pct']:>5.1f}%  {bar}")
        
    print("\n📁 Model saved to: model.joblib")
    print("=" * 65)

if __name__ == "__main__":
    main()
