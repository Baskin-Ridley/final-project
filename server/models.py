from database import db
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY

# notification model


class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    user_name = db.Column(db.String(255), nullable=False)
    super_user_name = db.Column(db.String(255), nullable=False)

    def __init__(self, content, user_name, super_user_name):
        self.content = content
        self.user_name = user_name
        self.super_user_name = super_user_name


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    avatar = db.Column(db.String(255), nullable=True)
    supervisors = db.Column(ARRAY(db.String()), nullable=True)
    isSuper = db.Column(db.Boolean, nullable=False, default=False)

    def __init__(self, username, name, password, role, email, supervisors, isSuper=False, avatar=None):
        self.username = username
        self.name = name
        self.password = password
        self.role = role
        self.email = email
        self.supervisors = supervisors
        self.isSuper = isSuper
        self.avatar = avatar

    def check_password(self, password):
        return self.password == password


class Super_User(db.Model):
    __tablename__ = 'super_User'
    id = db.Column(db.Integer, unique=True, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    members = db.Column(ARRAY(db.String()), nullable=True)
    email = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(80), nullable=False)
    isSuper = db.Column(db.Boolean(), unique=False, default=True)

    def __init__(self, username, name, password, members, role, email, isSuper=True):
        self.username = username
        self.name = name
        self.password = password
        self.members = members
        self.role = role
        self.email = email
        self.isSuper = isSuper

    def check_password(self, password):
        return self.password == password


class Kanban_Header(db.Model):
    __tablename__ = 'header'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    kanban_board_id = db.Column(db.Integer, db.ForeignKey(
        'kanban_board.id'), nullable=False)
    kanban_board = relationship("Kanban_Board", back_populates="headers")
    tickets = relationship(
        "Kanban_Ticket", back_populates="header", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "header_id": self.id,
            "header_name": self.name,
            "kanban_board_id": self.kanban_board_id,
            "tickets_under_this_header": [ticket.id for ticket in self.tickets]
        }


class Kanban_Board(db.Model):
    __tablename__ = 'kanban_board'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id'), name='kanban_board_user_id', nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    positions = db.Column(db.JSON, nullable=True)
    headers = relationship("Kanban_Header", back_populates="kanban_board")
    tickets = relationship("Kanban_Ticket", back_populates="kanban_board")

    def serialize(self):
        return {
            "board_id": self.id,
            "board_creator_id": self.user_id,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "boards_headers": [header.serialize() for header in self.headers]
        }


class Kanban_Ticket(db.Model):
    __tablename__ = 'kanban_ticket'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id'), name='kanban_ticket_user_id', nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    ticket_status = db.Column(db.String(80), nullable=False)
    kanban_board_id = db.Column(db.Integer, db.ForeignKey(
        'kanban_board.id'), name='kanban_ticket_board_id', nullable=False)
    header_id = db.Column(db.Integer, db.ForeignKey(
        'header.id'), nullable=False)
    assigned = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    test_technologies = db.Column(db.String(120), nullable=True)
    test_testing_framework = db.Column(db.String(120), nullable=True)
    test_function = db.Column(db.String(120), nullable=True)
    test_generated_test = db.Column(db.String(120), nullable=True)
    kanban_board = relationship("Kanban_Board", back_populates="tickets")
    header = relationship("Kanban_Header", back_populates="tickets")

    def serialize(self):
        return {
            "ticket_id": self.id,
            "ticket_title": self.title,
            "ticket_content": self.content,
            "ticket_creator_id": self.user_id,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "ticket_status": self.ticket_status,
            "kanban_board_id": self.kanban_board_id,
            "header_id": self.header_id,
            "user_assigned": self.assigned,
            "test_technologies": self.test_technologies,
            "test_testing_framework": self.test_testing_framework,
            "test_function": self.test_function,
            "test_generated_test": self.test_generated_test,
        }
