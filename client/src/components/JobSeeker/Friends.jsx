import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search,
  Mail,
  MapPin,
  Briefcase,
  Check,
  X,
  Loader
} from 'lucide-react';

// 👇 Change this to match your backend URL
const API_URL = 'http://localhost:5001/api';

const Friends = ({ userData }) => {
  const [activeView, setActiveView] = useState('all'); // 'all', 'requests', 'suggestions'
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFriends(),
        fetchFriendRequests(),
        fetchSuggestions()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends/friends`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFriends(data.friends);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
      throw err;
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends/requests`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFriendRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      throw err;
    }
  };

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends/suggestions`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      throw err;
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends/request/${requestId}/accept`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove from requests and refresh friends list
        setFriendRequests(friendRequests.filter(req => req.id !== requestId));
        await fetchFriends();
        setError(null);
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends/request/${requestId}/reject`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setFriendRequests(friendRequests.filter(req => req.id !== requestId));
        setError(null);
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject friend request. Please try again.');
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends/request`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipientId: userId })
      });

      const data = await response.json();

      if (data.success) {
        // Remove from suggestions
        setSuggestions(suggestions.filter(sug => sug.id !== userId));
        setError(null);
        // Show success message
        alert('Friend request sent successfully!');
      } else {
        const message = data.message || 'Failed to send friend request. Please try again.';
        setError(message);
        alert(message);
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      const message = 'Failed to send friend request. Please try again.';
      setError(message);
      alert(message);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends/friend/${friendId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setFriends(friends.filter(friend => friend.id !== friendId));
        setError(null);
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend. Please try again.');
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FriendCard = ({ person, type }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {person.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg">{person.name}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Briefcase size={14} />
            {person.role} at {person.company}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <MapPin size={14} />
            {person.location}
          </p>
          {person.mutualFriends > 0 && (
            <p className="text-sm text-indigo-600 mt-2">
              {person.mutualFriends} mutual {person.mutualFriends === 1 ? 'friend' : 'friends'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {type === 'friend' && (
            <>
              <button
                onClick={() => window.location.href = `mailto:${person.email}`}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Send Message"
              >
                <Mail size={18} />
              </button>
              <button
                onClick={() => handleRemoveFriend(person.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Friend"
              >
                <UserX size={18} />
              </button>
            </>
          )}
          
          {type === 'request' && (
            <>
              <button
                onClick={() => handleAcceptRequest(person.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Accept Request"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleRejectRequest(person.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject Request"
              >
                <X size={18} />
              </button>
            </>
          )}
          
          {type === 'suggestion' && (
            <button
              onClick={() => handleAddFriend(person.id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading && friends.length === 0 && friendRequests.length === 0 && suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
          <p className="text-gray-600">Loading friends data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-indigo-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
              <p className="text-gray-600">Connect with other job seekers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
              {friends.length} Friends
            </div>
            {friendRequests.length > 0 && (
              <div className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium">
                {friendRequests.length} Requests
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search friends by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeView === 'all'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveView('requests')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeView === 'requests'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Requests ({friendRequests.length})
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveView('suggestions')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeView === 'suggestions'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeView === 'all' && (
          <>
            {filteredFriends.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No friends found' : 'No friends yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Start connecting with other job seekers to build your network'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setActiveView('suggestions')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Suggestions
                  </button>
                )}
              </div>
            ) : (
              filteredFriends.map(friend => (
                <FriendCard key={friend.id} person={friend} type="friend" />
              ))
            )}
          </>
        )}

        {activeView === 'requests' && (
          <>
            {friendRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <UserCheck className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">You don't have any friend requests at the moment</p>
              </div>
            ) : (
              friendRequests.map(request => (
                <FriendCard key={request.id} person={request} type="request" />
              ))
            )}
          </>
        )}

        {activeView === 'suggestions' && (
          <>
            {suggestions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <UserPlus className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions available</h3>
                <p className="text-gray-600">Check back later for friend suggestions</p>
              </div>
            ) : (
              <>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-900 font-medium">
                    💡 People you may know based on mutual connections and similar interests
                  </p>
                </div>
                {suggestions.map(suggestion => (
                  <FriendCard key={suggestion.id} person={suggestion} type="suggestion" />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;