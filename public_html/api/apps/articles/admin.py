from django.contrib import admin
from .models import Article, ArticleComment

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_active', 'created_at']
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'content']

@admin.register(ArticleComment)
class ArticleCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'article', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['content', 'user__mobile', 'article__title']
    actions = ['approve_comments']

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "تایید نظرات انتخاب شده"
