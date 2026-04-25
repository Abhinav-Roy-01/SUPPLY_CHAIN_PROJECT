"""
Service: P&L Auto Calculator
Computes net profit/loss for a trip on completion.
"""

def calculate_trip_pnl(
    freight_amount: float,
    toll_expense: float = 0,
    fuel_expense: float = 0,
    driver_expense: float = 0,
    other_expense: float = 0,
) -> dict:
    """
    Returns P&L breakdown for a completed trip.
    """
    total_expense = toll_expense + fuel_expense + driver_expense + other_expense
    net_profit = freight_amount - total_expense
    margin_pct = (net_profit / freight_amount * 100) if freight_amount > 0 else 0

    return {
        "freight_amount": round(freight_amount, 2),
        "total_expense": round(total_expense, 2),
        "net_profit": round(net_profit, 2),
        "margin_pct": round(margin_pct, 1),
        "breakdown": {
            "toll": round(toll_expense, 2),
            "fuel": round(fuel_expense, 2),
            "driver": round(driver_expense, 2),
            "other": round(other_expense, 2),
        }
    }
