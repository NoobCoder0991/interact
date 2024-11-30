function moveToFront(array, index) {
    // Check if the index is valid
    if (index < 0 || index >= array.length) {
        console.error('Invalid index');
        return array;
    }


    // Remove the element from the specified index
    const element = array.splice(index, 1)[0];

    // Add the element to the front of the array
    array.unshift(element);

    return array;
}


async function reorderFriends(db, sender, receiver) {

    const userData = await db.collection('user_data').findOne({ userid: sender }, { projection: { _id: 0, userid: 0, username: 0 } });
    const friendArr = userData.friends
    const index = friendArr.indexOf(receiver);
    const newFriendsArr = moveToFront(friendArr, index);
    await db.collection("user_data").updateOne({ userid: sender }, { $set: { friends: newFriendsArr } })

}

module.exports = { moveToFront, reorderFriends }