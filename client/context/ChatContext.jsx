import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";



export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    //const [typingUsers, setTypingUsers] = useState([]); // Users who are currently typing

    const {socket, axios} = useContext(AuthContext);

    
    // Function to get users to show in sidebar (All users)
    const getUsers = async () => {
        try {
            const {data} = await axios.get('/api/messages/users');
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


    // Function to get messages of selected user
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages);
                // setSelectedUser(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    

    // Function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success){
                setMessages(prev => [...prev, data.newMessage]);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Function to subscribe to message for a selected user
    const subscribeToMessages = async () => {
        if(!socket) return;

        socket.on("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.isSeen = true;
                setMessages(prev => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] ? prev[newMessage.senderId]+1 : 1)
                }));
            }
        })
    }



    // function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if(!socket) return;
        socket.off("newMessage");
    }


    useEffect(() => {
        subscribeToMessages();
        return () => {
            unsubscribeFromMessages();
        }
    },[socket, selectedUser]);

    // Friend-related functions
    const sendFriendRequest = async (recipientId) => {
        try {
            const {data} = await axios.post('/api/friends/request/send', {recipientId});
            if(data.success){
                toast.success(data.message);
                setSentRequests(prev => [...prev, {_id: recipientId}]);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const acceptFriendRequest = async (senderId) => {
        try {
            const {data} = await axios.post('/api/friends/request/accept', {senderId});
            if(data.success){
                toast.success(data.message);
                setFriendRequests(prev => prev.filter(req => req._id !== senderId));
                getUsers(); // Refresh friends list
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const rejectFriendRequest = async (senderId) => {
        try {
            const {data} = await axios.post('/api/friends/request/reject', {senderId});
            if(data.success){
                toast.success(data.message);
                setFriendRequests(prev => prev.filter(req => req._id !== senderId));
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const cancelFriendRequest = async (recipientId) => {
        try {
            const {data} = await axios.post('/api/friends/request/cancel', {recipientId});
            if(data.success){
                toast.success(data.message);
                setSentRequests(prev => prev.filter(req => req._id !== recipientId));
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const getFriendRequests = async () => {
        try {
            const {data} = await axios.get('/api/friends/requests/pending');
            if(data.success){
                setFriendRequests(data.requests);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const getSentRequests = async () => {
        try {
            const {data} = await axios.get('/api/friends/requests/sent');
            if(data.success){
                setSentRequests(data.sentRequests);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const removeFriend = async (friendId) => {
        try {
            const {data} = await axios.post('/api/friends/remove', {friendId});
            if(data.success){
                toast.success(data.message);
                getUsers(); // Refresh friends list
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const value = {
        messages,
        setMessages,
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        // Friend-related
        friendRequests,
        sentRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        getFriendRequests,
        getSentRequests,
        removeFriend
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}