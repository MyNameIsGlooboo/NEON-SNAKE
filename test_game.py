import pytest
from game import generateFood, move, initGame, snake, food, directionQueue

def test_generate_food():
    initGame()
    initial_food_position = (food['x'], food['y'])
    generateFood()
    new_food_position = (food['x'], food['y'])
    assert initial_food_position != new_food_position, "Food should be generated at a new position"

def test_snake_movement():
    initGame()
    initial_snake_length = len(snake)
    directionQueue.append({'dx': 1, 'dy': 0})  # Move right
    move()
    assert len(snake) == initial_snake_length + 1, "Snake should grow after eating food"
