import networkx as nx
from sklearn.ensemble import IsolationForest
import numpy as np

class CascadeRiskEngine:
    def __init__(self):
        self.G = nx.DiGraph()
        # We use a lower contamination since we are looking for extreme anomalies
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
    
    def build_trip_graph(self, active_trips: list) -> nx.DiGraph:
        """Build dependency graph from active trips"""
        G = nx.DiGraph()
        for trip in active_trips:
            G.add_node(trip['id'], **trip)
        
        # Add edges for dependencies
        for i, trip_a in enumerate(active_trips):
            for trip_b in active_trips[i+1:]:
                weight = self._compute_dependency_weight(trip_a, trip_b)
                if weight > 0:
                    G.add_edge(trip_a['id'], trip_b['id'], weight=weight)
        
        self.G = G
        return G
    
    def _compute_dependency_weight(self, trip_a: dict, trip_b: dict) -> float:
        weight = 0.0
        # Same truck constraint (strongest)
        if trip_a.get('truck_id') == trip_b.get('truck_id'):
            weight += 0.9
        # Same destination warehouse
        if trip_a.get('destination') == trip_b.get('destination'):
            weight += 0.6
        # Overlapping time windows on same corridor
        if trip_a.get('route_id') == trip_b.get('route_id'):
            weight += 0.3
        return min(weight, 1.0)
    
    def simulate_cascade(self, source_trip_id: str, delay_probability: float) -> dict:
        """Simulate cascade from a delayed trip"""
        if delay_probability < 0.5:
            return {"cascade_count": 0, "at_risk_trips": []}
        
        if source_trip_id not in self.G:
            return {"cascade_count": 0, "at_risk_trips": []}
            
        at_risk = []
        visited = set()
        
        def propagate(node_id, current_risk, depth=0):
            if depth > 3 or node_id in visited:
                return
            visited.add(node_id)
            
            for successor in self.G.successors(node_id):
                edge_weight = self.G[node_id][successor]['weight']
                ripple_risk = current_risk * edge_weight * (0.8 ** depth)
                
                if ripple_risk > 0.3:
                    at_risk.append({
                        'trip_id': successor,
                        'risk_score': round(ripple_risk, 3),
                        'depth': depth + 1
                    })
                    propagate(successor, ripple_risk, depth + 1)
        
        propagate(source_trip_id, delay_probability)
        return {
            "cascade_count": len(at_risk),
            "at_risk_trips": sorted(at_risk, key=lambda x: -x['risk_score'])
        }
    
    def fit_anomaly_detector(self, training_features: np.ndarray):
        """Fit the isolation forest on historical features"""
        self.anomaly_detector.fit(training_features)
        
    def detect_anomalies(self, trip_features: np.ndarray) -> list:
        """Use Isolation Forest to detect unusual trip patterns"""
        scores = self.anomaly_detector.decision_function(trip_features)
        return (scores < -0.1).tolist()  # True = anomalous
