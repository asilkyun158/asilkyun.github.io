import 'dotenv/config';
import express from 'express';
import { UserModel, postModel } from './config/mongoose.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/create-user", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        
        return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    }

    try {
        const result = await UserModel.create({username: username})
        
        
        return res.status(200).json({ message: "Thêm thành công" });
    } catch (error) {
        
        return res.status(500).json({ error: "Đã xảy ra lỗi khi thêm dữ liệu" });
    }
});

app.get("/api/users", async (req, res) => {
    await UserModel.find({})
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.send('Không thành công')
        })    
})

app.delete("/api/del-user/:IdUser", async (req, res) => {
    const IdUser = req.params.IdUser;

    try {
        // Kiểm tra xem người dùng tồn tại
        const user = await UserModel.findById(IdUser);
        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        // Xóa người dùng
        await UserModel.deleteOne({ _id: IdUser });
        return res.send('Xóa thành công');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Đã xảy ra lỗi khi xóa người dùng');
    }
});

app.post("/api/create-post/:IdUser", async (req, res) => {
    const { title, content } = req.body;
    const id_user = req.params.IdUser;
    if (!id_user) {
        
        return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    }
    else {
        const newPost = await postModel.create({ title: title, content: content, id_user: id_user })

        const user = await UserModel.findById(id_user);
        user.posts.push(newPost._id);
        await user.save();
        return res.status(201).json({ message: "Tạo bài đăng thành công", post: newPost });
    }
})

app.delete("/api/del-post/:IdPost", async (req, res) => {
    const IdPost = req.params.IdPost;
    const user = await UserModel.findOne({posts: IdPost});
    const index = user.posts.indexOf(IdPost);
    if (index !== -1) {
        user.posts.splice(index, 1);
    }
    await user.save();
    await postModel.deleteOne({ _id: IdPost });
    return res.send("Xóa post thành công");
})

app.get("/api/user-posts/:username", async (req, res) => {
    try {
        const username = req.params.username;
        
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).send("Người dùng không tồn tại");
        }

        const userPosts = await postModel.find({ _id: { $in: user.posts } });

        return res.json(userPosts);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Lỗi server");
    }
});

app.put("/api/edit-post/:IdPost", async (req, res) => {
    const IdPost = req.params.IdPost;
    const { title, content } = req.body;
    await postModel.updateOne(
        { _id: IdPost },
        { $set: { title: title, content: content } }
    );
    return res.status(201).json({ message: "Cập nhật post thành công" });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
