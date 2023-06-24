import { useState, FormEvent } from 'react';

type Friend = {
  id: number | string;
  name: string;
  image: string;
  balance: number;
};

const initialFriends = [
  {
    id: 118836,
    name: 'Clark',
    image: 'https://i.pravatar.cc/48?u=118836',
    balance: -7,
  },
  {
    id: 933372,
    name: 'Sarah',
    image: 'https://i.pravatar.cc/48?u=933372',
    balance: 20,
  },
  {
    id: 499476,
    name: 'Anthony',
    image: 'https://i.pravatar.cc/48?u=499476',
    balance: 0,
  },
];

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className='button'>
      {children}
    </button>
  );
}

export default function App() {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  function handleShowAddFriend() {
    setShowAddFriend((s) => !s);
  }

  function handleAddFriend(friend: Friend) {
    setFriends((f) => [...f, friend]);
    setShowAddFriend(false);
  }

  function handleSelection(friend: Friend) {
    setSelectedFriend((current) => (friend.id === current?.id ? null : friend));
    setShowAddFriend(false);
  }

  function handleSplitBill(value: number) {
    setFriends((f) =>
      f.map((friend) =>
        friend.id === selectedFriend?.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );
    setSelectedFriend(null);
  }

  return (
    <div className='app'>
      <div className='sidebar'>
        <FriendsList
          friends={friends}
          onSelection={handleSelection}
          selectedFriend={selectedFriend}
        />

        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}

        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? 'Close' : 'Add friend'}
        </Button>
      </div>
      {selectedFriend && (
        <FormSplitBill
          key={selectedFriend.id}
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

interface FriendsListProps {
  friends: Friend[];
  onSelection: (friend: Friend) => void;
  selectedFriend: Friend | null;
}

function FriendsList({
  friends,
  onSelection,
  selectedFriend,
}: FriendsListProps) {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          key={friend.id}
          friend={friend}
          onSelection={onSelection}
          selectedFriend={selectedFriend}
        />
      ))}
    </ul>
  );
}

interface FriendProps {
  friend: Friend;
  onSelection: (friend: Friend) => void;
  selectedFriend: Friend | null;
}

function Friend({ friend, onSelection, selectedFriend }: FriendProps) {
  const { name, image, balance, id } = friend;

  const isSelected = selectedFriend?.id === id;

  return (
    <li className={isSelected ? 'selected' : ''}>
      <img src={image} alt={name} />
      <h3>{name}</h3>
      {balance < 0 && (
        <p className='red'>
          You owe {name} ${Math.abs(balance)}
        </p>
      )}
      {balance > 0 && (
        <p className='green'>
          {name} owes you ${Math.abs(balance)}
        </p>
      )}
      {balance === 0 && <p>You and {name} are even</p>}
      <Button onClick={() => onSelection(friend)}>
        {isSelected ? 'Close' : 'Select'}
      </Button>
    </li>
  );
}

interface FormAddFriendProps {
  onAddFriend: (friend: Friend) => void;
}

function FormAddFriend({ onAddFriend }: FormAddFriendProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('https://i.pravatar.cc/48');

  function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    if (!name || !image) return;

    const id = crypto.randomUUID();
    const newFriend = {
      id,
      name,
      image: `${image}?u=${id}`,
      balance: 0,
    };

    onAddFriend(newFriend);

    setName('');
    setImage('https://i.pravatar.cc/48');
  }

  return (
    <form className='form-add-friend' onSubmit={handleSubmit}>
      <label>👩🏼‍🤝‍🧑🏽 Friend name</label>
      <input
        type='text'
        value={name}
        onChange={(evt) => setName(evt.target.value)}
      />

      <label>📸 Image URL</label>
      <input
        type='text'
        value={image}
        onChange={(evt) => setImage(evt.target.value)}
      />

      <Button>Add</Button>
    </form>
  );
}

interface FormSplitBillProps {
  selectedFriend: Friend;
  onSplitBill: (amount: number) => void;
}

function FormSplitBill({ selectedFriend, onSplitBill }: FormSplitBillProps) {
  const { name } = selectedFriend;
  const [bill, setBill] = useState(0);
  const [paidByUser, setPaidByUser] = useState(0);
  const paidByFriend = paidByUser ? bill - paidByUser : 0;
  const [whoIsPaying, setWhoIsPaying] = useState('user');

  function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    if (!bill || !paidByUser) return;
    onSplitBill(whoIsPaying === 'user' ? paidByFriend : -paidByUser);
  }

  return (
    <form className='form-split-bill' onSubmit={handleSubmit}>
      <h2>Split a bill with {name}</h2>

      <label>💰 Bill value</label>
      <input
        type='text'
        value={bill}
        onChange={(evt) => setBill(Number(evt.target.value))}
      />

      <label>🤠 Your expense</label>
      <input
        type='text'
        value={paidByUser}
        onChange={(evt) =>
          setPaidByUser(
            Number(evt.target.value) > bill
              ? paidByUser
              : Number(evt.target.value)
          )
        }
      />

      <label>🤖 {name} Expense</label>
      <input type='text' disabled value={paidByFriend} />

      <label>🤑 Who is paying the bill?</label>
      <select
        value={whoIsPaying}
        onChange={(evt) => setWhoIsPaying(evt.target.value)}
      >
        <option value='user'>You</option>
        <option value='friend'>{name}</option>
      </select>

      <Button>Split bill</Button>
    </form>
  );
}
