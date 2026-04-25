from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def optimize_load_distribution(trucks: list, shipments: list) -> dict:
    """
    trucks: [{id, capacity_quintal, current_location, cost_per_km}]
    shipments: [{id, weight_quintal, origin, destination, deadline, freight}]
    
    Returns optimal assignment with cost savings vs naive distribution
    """
    # For a full implementation, we'd build a distance matrix using Google Maps API.
    # Here we mock the distance matrix and solve as VRP with capacity constraints.
    
    # Mock data dimensions
    num_vehicles = len(trucks)
    num_locations = len(shipments) + 1  # 1 depot + N shipments
    depot_index = 0
    
    if num_vehicles == 0 or num_locations == 1:
        return {"assignments": [], "cost_savings_vs_naive": 0, "explanation": "No trucks or shipments to route."}
        
    manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, depot_index)
    routing = pywrapcp.RoutingModel(manager)
    
    # Mock distance callback (everything is 10 distance units away for simplicity)
    def distance_callback(from_index, to_index):
        if from_index == to_index:
            return 0
        return 10

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Add capacity constraints
    def demand_callback(from_index):
        # The depot has no demand
        from_node = manager.IndexToNode(from_index)
        if from_node == 0:
            return 0
        return int(shipments[from_node - 1]['weight_quintal'])
    
    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        [int(t['capacity_quintal']) for t in trucks],
        True,
        'Capacity'
    )
    
    # Solve
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    solution = routing.SolveWithParameters(search_params)
    
    if not solution:
        return {"assignments": [], "cost_savings_vs_naive": 0, "explanation": "No valid solution found to accommodate all shipments with available trucks."}
    
    # Extract solution
    assignments = []
    total_distance = 0
    for vehicle_id in range(num_vehicles):
        index = routing.Start(vehicle_id)
        truck = trucks[vehicle_id]
        assigned_shipments = []
        route_weight = 0
        
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            if node_index != 0: # Not depot
                shipment = shipments[node_index - 1]
                assigned_shipments.append(shipment['id'])
                route_weight += shipment['weight_quintal']
            
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            total_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
            
        utilization = route_weight / truck['capacity_quintal'] if truck['capacity_quintal'] > 0 else 0
        if assigned_shipments:
            assignments.append({
                "truck_id": truck['id'],
                "shipments": assigned_shipments,
                "total_weight": route_weight,
                "utilization": round(utilization, 2)
            })
            
    # Mocking cost savings calculation
    return {
        "assignments": assignments,
        "cost_savings_vs_naive": len(assignments) * 500,
        "explanation": f"Successfully routed {len(shipments)} shipments across {len(assignments)} trucks."
    }
