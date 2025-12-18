// تابعی برای آپلود عکس پروفایل
const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file); // مطمئن شو توی مدل جنگو اسم فیلد avatar هست

    try {
        await api.patch("/users/profile/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("عکس پروفایل آپدیت شد");
        window.location.reload(); // یا استفاده از mutate برای رفرش بدون لود
    } catch (error) {
        toast.error("خطا در آپلود عکس");
    }
};

// ... در قسمت JSX، روی عکس پروفایل این اینپوت رو بذار:
<div className="relative group cursor-pointer w-20 h-20 mx-auto mb-4">
    <img src={user.avatar || "/default-avatar.png"} className="w-full h-full rounded-full object-cover border-2 border-primary" />
    
    {/* لایه مخفی که با هاور نمایش داده میشه */}
    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <span className="text-white text-xs">ویرایش</span>
    </div>
    
    <input type="file" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />
</div>