import pytest
import random

# Mocking the game logic
snake = [{'x': 10, 'y': 10}, {'x': 9, 'y': 10}, {'x': 8, 'y': 10}]
food = {}
directionQueue = []

def generateFood():
    food['x'] = random.randint(0, 19)
    food['y'] = random.randint(0, 19)

    # Make sure food doesn't appear on snake
    for segment in snake:
        if segment['x'] == food['x'] and segment['y'] == food['y']:
            return generateFood()

def initGame():
    global snake, food, directionQueue
    snake = [{'x': 10, 'y': 10}, {'x': 9, 'y': 10}, {'x': 8, 'y': 10}]
    directionQueue = []
    generateFood()

def move():
    global snake
    if directionQueue:
        nextDir = directionQueue.pop(0)
        head = {'x': snake[0]['x'] + nextDir['dx'], 'y': snake[0]['y'] + nextDir['dy']}
        snake.insert(0, head)

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
