# Graph Report - shop  (2026-08-16)

## Corpus Check
- 347 files · ~2,548,188 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2910 nodes · 4542 edges · 261 communities (169 shown, 92 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `03275388`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TargetType
- TBanner
- TStory
- TBrand
- Category
- product.module.ts
- FilesDS
- UserEntity
- [slug].vue
- auth/controllers/index.controller.ts
- ProductFormModal.vue
- admin/products/index.vue
- products/types/index.type.ts
- UsersService
- pages/products/index.vue
- attribute.controller.ts
- TProduct
- chat/types/index.type.ts
- ProductsService
- CreateProductDto
- StoryService
- product.service.ts
- app.module.ts
- Product
- attributes/index.vue
- AdminService
- interactions/controllers/index.controller.ts
- brand.controller.ts
- ProductService
- dependencies
- ProductDetailsModal.vue
- Roles
- Blog
- dataStore/index.ts
- ChatRoom.vue
- auth.service.ts
- ProductVariant
- ProductController
- BaseApp
- BlogFormModal.vue
- ChatDS
- OtpService
- AttributesDS
- CategoriesDS
- chat/models/index.model.ts
- BlogController
- ChatController
- ProductTag
- compilerOptions
- BaseFilePicker.vue
- ProductFiltersDrawer.vue
- CartDS
- TAdmin
- TUserProfile
- categories/index.vue
- dependencies
- FileService
- CategoriesService
- banners/index.vue
- blogs/index.vue
- brands/index.vue
- stories/index.vue
- BannersController
- QueryBlogDto
- main.ts
- PublicStoryCarousel.vue
- TAttributeValue
- CategoryFormModal.vue
- favorites/types/index.type.ts
- scripts
- banners.controller.ts
- BlogService
- 1786500000000-AddRandomSpecsToProducts.ts
- CreateBlogDto
- PublicBannerCarousel.vue
- PublicProductFilters.vue
- AttributeValueFormModal.vue
- files/index.vue
- pages/index.vue
- update.vue
- FavoritesController
- AttributeFormModal.vue
- TAttribute
- ChatMessageModel
- jest
- FileController
- auth.module.ts
- QueryProductDto
- PublicStoryViewer.vue
- user/data/index.store.ts
- TBlog
- CategoriesTable.vue
- ProductsTable.vue
- client/package.json
- AuthService
- BlogsDS
- ChatService
- QueryChatsDto
- 1786000000000-AddSpecificationsToProducts.ts
- Story
- ProfileMenu.vue
- PublicCommentTextarea.vue
- TCategory
- TChat
- server/README.md
- Banner
- ProfileShell.vue
- BlogsTable.vue
- blogs/types/index.type.ts
- BlogsService
- UserProfileDS
- chat/index.vue
- customers/index.ts
- devDependencies
- devDependencies
- JwtAuthGuard
- BasePaginationFooter.vue
- PublicNavLinks.vue
- StoreManager
- ChatMessageInput.vue
- FileUploadModal.vue
- AdminDS
- [id].vue
- favorites.vue
- Nuxt Dashboard Template
- renovate.json
- exclude
- dbConfig.ts
- blog.controller.ts
- UpdateStoryDto
- PublicActiveFilterChips.vue
- PublicProductCard.vue
- attributes/data/index.store.ts
- server/package.json
- BannersService
- QueryMessagesDto
- BasePageHeader.vue
- AttributesTable.vue
- nest-cli.json
- app.vue
- PublicMobileMenu.vue
- textEditor/index.vue
- navigation.ts
- AttributeDeleteConfirmModal.vue
- AttributeValueDeleteConfirmModal.vue
- BlogDeleteConfirmModal.vue
- CategoryDeleteConfirmModal.vue
- TProductAttributeWithValues
- .upload
- PublicBestSellers.vue
- PublicHeaderActions.vue
- PublicProductComments.vue
- PublicProductGallery.vue
- BaseController
- ProductDeleteConfirmModal.vue
- user.ts
- CreateDto
- LocalAuthGuard
- AddSalePriceToProductsAndVariants1785670000000
- AddCommentUserRelation1786100000000
- BaseResponsiveDataView.vue
- JsonLd.vue
- PublicCategoryGrid.vue
- PublicNavbar.vue
- PublicProductInfo.vue
- PublicProductOptions.vue
- public-navigation.ts
- auth.vue
- common.ts
- client/tsconfig.json
- class-validator
- NotificationsSlideover.vue
- PublicProductActions.vue
- PublicProductPrice.vue
- useToast.client.ts
- @iconify-json/simple-icons
- @internationalized/date
- nuxt-schema-org
- @nuxt/ui
- @nuxtjs/robots
- scule
- tailwindcss
- @tanstack/table-core
- @tiptap/extension-placeholder
- @tiptap/extension-text-align
- @tiptap/starter-kit
- @tiptap/vue-3
- @unovis/ts
- @unovis/vue
- vue
- vue3-toastify
- @vueuse/core
- @vueuse/nuxt
- sitemap-products.ts
- eslint
- eslint-config-prettier
- @eslint/eslintrc
- @eslint/js
- eslint-plugin-prettier
- globals
- multer
- @nestjs/cli
- @nestjs/core
- @nestjs/jwt
- @nestjs/passport
- @nestjs/platform-express
- @nestjs/schematics
- @nestjs/testing
- @nestjs/typeorm
- otplib
- passport
- passport-jwt
- reflect-metadata
- rxjs
- slugify
- typeorm
- prettier
- source-map-support
- supertest
- @swc/cli
- @swc/core
- ts-jest
- ts-loader
- ts-node
- @types/bcrypt
- @types/express
- @types/passport-jwt
- @types/passport-local
- @types/supertest
- typescript
- typescript-eslint
- auth-jwtPayload.d.ts

## God Nodes (most connected - your core abstractions)
1. `Product` - 41 edges
2. `ProductService` - 32 edges
3. `ChatDS` - 30 edges
4. `CreateProductDto` - 30 edges
5. `ProductsService` - 29 edges
6. `TProduct` - 25 edges
7. `Category` - 24 edges
8. `UserEntity` - 23 edges
9. `TAttribute` - 22 edges
10. `Blog` - 22 edges

## Surprising Connections (you probably didn't know these)
- `IUserProfileState` --references--> `TUserProfile`  [EXTRACTED]
  client/app/features/profile/user/data/index.store.ts → client/app/features/profile/user/types/index.type.ts
- `AdminDS` --inherits--> `BaseStore`  [EXTRACTED]
  client/app/features/profile/admin/data/index.store.ts → client/app/core/BaseStore.ts
- `UserProfileDS` --inherits--> `BaseStore`  [EXTRACTED]
  client/app/features/profile/user/data/index.store.ts → client/app/core/BaseStore.ts
- `AttributeValueModel` --implements--> `TAttributeValue`  [EXTRACTED]
  client/app/features/attributes/models/index.model.ts → client/app/features/attributes/types/index.type.ts
- `AttributeModel` --implements--> `TAttribute`  [EXTRACTED]
  client/app/features/attributes/models/index.model.ts → client/app/features/attributes/types/index.type.ts

## Import Cycles
- None detected.

## Communities (261 total, 92 thin omitted)

### Community 0 - "TargetType"
Cohesion: 0.05
Nodes (52): CreateCommentDto, IsEnum, IsString, IsUUID, MaxLength, MinLength, LikeStatusQueryDto, IsEnum (+44 more)

### Community 1 - "TBanner"
Cohesion: 0.05
Nodes (27): emit, modalOpen, props, bannerSchema, emit, handleSubmit(), isEditing, modalOpen (+19 more)

### Community 2 - "TStory"
Cohesion: 0.06
Nodes (29): currentPage, emit, paginatedStories, props, totalItems, emit, handleConfirm(), modalOpen (+21 more)

### Community 3 - "TBrand"
Cohesion: 0.06
Nodes (27): emit, modalOpen, props, brandSchema, emit, handleSubmit(), isEditing, modalOpen (+19 more)

### Community 4 - "Category"
Cohesion: 0.06
Nodes (35): InjectDataSource, CategoriesController, Body, Controller, Delete, Get, Param, Patch (+27 more)

### Community 5 - "product.module.ts"
Cohesion: 0.06
Nodes (45): InjectRepository, Attribute, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany (+37 more)

### Community 6 - "FilesDS"
Cohesion: 0.06
Nodes (17): emit, modalOpen, props, config, currentPage, emit, paginatedFiles, props (+9 more)

### Community 7 - "UserEntity"
Cohesion: 0.08
Nodes (35): ChatModule, Module, ChatAdminRawRow, ChatUserRawRow, InjectRepository, Chat, Column, CreateDateColumn (+27 more)

### Community 8 - "[slug].vue"
Cohesion: 0.05
Nodes (38): activeVariant, cartDS, comments, commentsLoaded, commentsLoading, commentsMeta, commentsPage, commentSubmitting (+30 more)

### Community 9 - "auth/controllers/index.controller.ts"
Cohesion: 0.07
Nodes (26): AuthController, AuthService, TLoginData, TLoginPayload, TUserData, TUserLoginData, TUserLoginPayload, TUserOtpPayload (+18 more)

### Community 10 - "ProductFormModal.vue"
Cohesion: 0.05
Nodes (33): addOption(), addVariant(), createEmptyOption(), createEmptyVariant(), emit, handleSubmit(), hasRelatedEntities, isEditing (+25 more)

### Community 11 - "admin/products/index.vue"
Cohesion: 0.06
Nodes (36): attributes, attributeSelections, brands, buildAttributeValueIds(), buildFiltersQuery(), buildProductsQuery(), categories, categoriesDS (+28 more)

### Community 12 - "products/types/index.type.ts"
Cohesion: 0.10
Nodes (28): TProductFormState, ProductAttributeValueModel, ProductCategoryRefModel, ProductMediaModel, ProductOptionModel, ProductOptionValueModel, ProductTagModel, ProductTagRefModel (+20 more)

### Community 13 - "UsersService"
Cohesion: 0.08
Nodes (23): CreateDto, IsEmail, IsString, Length, IsEmail, IsOptional, IsString, MaxLength (+15 more)

### Community 14 - "pages/products/index.vue"
Cohesion: 0.06
Nodes (30): activeBrand, activeCategory, attributeSelections, brands, buildAttributeValueIds(), buildFiltersQuery(), buildProductsQuery(), categories (+22 more)

### Community 15 - "attribute.controller.ts"
Cohesion: 0.09
Nodes (24): AttributeController, Body, Controller, Delete, Get, Param, Patch, Post (+16 more)

### Community 16 - "TProduct"
Cohesion: 0.09
Nodes (8): ProductsController, IProductsState, ProductsDS, ProductBrandRefModel, ProductModel, TProduct, TProductBrandRef, TProductPayload

### Community 17 - "chat/types/index.type.ts"
Cohesion: 0.14
Nodes (11): ChatService, TRawChat, TChatAdmin, TChatListData, TChatListQuery, TChatMessage, TChatMessagesData, TChatMessagesQuery (+3 more)

### Community 18 - "ProductsService"
Cohesion: 0.14
Nodes (3): ProductsService, TProductListData, TProductListQuery

### Community 19 - "CreateProductDto"
Cohesion: 0.06
Nodes (29): CreateProductDto, ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString (+21 more)

### Community 20 - "StoryService"
Cohesion: 0.09
Nodes (19): CreateStoryDto, IsBoolean, IsInt, IsOptional, IsString, Length, Min, StoryController (+11 more)

### Community 21 - "product.service.ts"
Cohesion: 0.15
Nodes (15): ChangeProductStatusDto, IsEnum, UpdateProductDto, ProductSpecification, ProductMedia, Column, CreateDateColumn, Entity (+7 more)

### Community 22 - "app.module.ts"
Cohesion: 0.10
Nodes (21): AdminModule, Module, AppController, Controller, Get, AppService, Injectable, AuthModule (+13 more)

### Community 23 - "Product"
Cohesion: 0.10
Nodes (20): Favorite, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, FavoritesService, Injectable (+12 more)

### Community 24 - "attributes/index.vue"
Cohesion: 0.09
Nodes (20): activeAttributeForValue, attributeOfValuePendingDelete, attributePendingDelete, attributes, attributesDS, editingAttribute, editingValue, fetchAttributes() (+12 more)

### Community 25 - "AdminService"
Cohesion: 0.13
Nodes (12): AdminController, Controller, Get, Req, UseGuards, AdminService, Injectable, InjectRepository (+4 more)

### Community 26 - "interactions/controllers/index.controller.ts"
Cohesion: 0.19
Nodes (11): InteractionsController, InteractionsService, TComment, TCommentListData, TCommentListQuery, TCommentPayload, TCommentUser, TInteractionTargetType (+3 more)

### Community 27 - "brand.controller.ts"
Cohesion: 0.11
Nodes (16): BrandController, Body, Controller, Delete, Get, InjectRepository, Param, Patch (+8 more)

### Community 29 - "dependencies"
Cohesion: 0.09
Nodes (23): bcrypt, cache-manager, class-transformer, @nestjs/cache-manager, @nestjs/common, @nestjs/config, @nestjs/mapped-types, passport-local (+15 more)

### Community 30 - "ProductDetailsModal.vue"
Cohesion: 0.09
Nodes (11): activeMedia, activeMediaIndex, emit, imagePreviewLabel, imagePreviewOpen, imagePreviewUrl, mediaItems, modalOpen (+3 more)

### Community 31 - "Roles"
Cohesion: 0.12
Nodes (14): IsNotEmpty, AuthenticatedRequest, CreateChatDto, IsOptional, IsString, MaxLength, SendMessageDto, IsOptional (+6 more)

### Community 32 - "Blog"
Cohesion: 0.11
Nodes (19): InjectRepository, Blog, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinTable (+11 more)

### Community 33 - "dataStore/index.ts"
Cohesion: 0.09
Nodes (5): appConfig, colorMode, primaryColors, themeModes, userStore

### Community 34 - "ChatRoom.vue"
Cohesion: 0.09
Nodes (11): emit, props, senderInitial, senderName, chatDS, loading, messages, props (+3 more)

### Community 35 - "auth.service.ts"
Cohesion: 0.17
Nodes (12): AuthController, Body, Controller, HttpCode, Post, LoginDto, IsString, MinLength (+4 more)

### Community 36 - "ProductVariant"
Cohesion: 0.09
Nodes (21): Brand, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn (+13 more)

### Community 37 - "ProductController"
Cohesion: 0.15
Nodes (10): ProductController, Body, Controller, Delete, Get, HttpCode, Param, Patch (+2 more)

### Community 38 - "BaseApp"
Cohesion: 0.15
Nodes (4): useCustomFetch(), BaseApp, HttpMethod, RequestErrorShape

### Community 39 - "BlogFormModal.vue"
Cohesion: 0.12
Nodes (16): blogSchema, emit, handleSubmit(), isEditing, modalOpen, normalizePayload(), products, productsLoading (+8 more)

### Community 40 - "ChatDS"
Cohesion: 0.12
Nodes (3): ChatDS, IChatState, TChatListMeta

### Community 41 - "OtpService"
Cohesion: 0.14
Nodes (9): OtpController, Body, Controller, Post, OtpModule, Module, OtpService, Inject (+1 more)

### Community 43 - "CategoriesDS"
Cohesion: 0.13
Nodes (3): CategoriesDS, ICategoriesState, CategoryModel

### Community 44 - "chat/models/index.model.ts"
Cohesion: 0.16
Nodes (10): emit, getSenderInitial(), getSenderName(), props, ChatLastMessageModel, ChatModel, ChatUserModel, TChatLastMessage (+2 more)

### Community 45 - "BlogController"
Cohesion: 0.19
Nodes (9): BlogController, Body, Controller, Delete, HttpCode, Param, Patch, Post (+1 more)

### Community 46 - "ChatController"
Cohesion: 0.24
Nodes (12): ChatController, Body, Controller, Delete, Get, HttpCode, Param, Patch (+4 more)

### Community 47 - "ProductTag"
Cohesion: 0.12
Nodes (17): ProductTag, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+9 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+10 more)

### Community 49 - "BaseFilePicker.vue"
Cohesion: 0.14
Nodes (13): buildFileUrl(), clearSelection(), config, emit, filesDS, imageFiles, isLoading, isModalOpen (+5 more)

### Community 50 - "ProductFiltersDrawer.vue"
Cohesion: 0.13
Nodes (13): clearFilters(), closeDrawer(), emit, openModel, props, searchInputModel, selectedBrandForSelect, selectedBrandIdModel (+5 more)

### Community 51 - "CartDS"
Cohesion: 0.15
Nodes (4): CartDS, ICartState, loadFromStorage(), TCartItem

### Community 52 - "TAdmin"
Cohesion: 0.21
Nodes (6): ProfileAdminController, IAdminState, initialAdmin, AdminModel, ProfileAdminService, TAdmin

### Community 53 - "TUserProfile"
Cohesion: 0.23
Nodes (5): ProfileUserController, UserModel, ProfileUserService, TUpdateUserPayload, TUserProfile

### Community 54 - "categories/index.vue"
Cohesion: 0.13
Nodes (13): categories, categoriesDS, categoryPendingDelete, editingCategory, fetchCategories(), handleDeleteConfirm(), handleFormSubmit(), isDeleteConfirmOpen (+5 more)

### Community 55 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, date-fns, @iconify-json/lucide, nuxt, @nuxt/image, @nuxtjs/sitemap, @tailwindcss/typography, @tiptap/extension-underline (+9 more)

### Community 56 - "FileService"
Cohesion: 0.18
Nodes (9): File, Column, Entity, PrimaryGeneratedColumn, FileModule, Module, FileService, Injectable (+1 more)

### Community 57 - "CategoriesService"
Cohesion: 0.24
Nodes (5): CategoriesService, TCategoryApiPayload, TRawCategory, TCategoryListData, TCategoryListQuery

### Community 58 - "banners/index.vue"
Cohesion: 0.14
Nodes (12): bannerPendingDelete, banners, bannersDS, editingBanner, fetchBanners(), handleDeleteConfirm(), handleFormSubmit(), isDeleteConfirmOpen (+4 more)

### Community 59 - "blogs/index.vue"
Cohesion: 0.14
Nodes (12): blogPendingDelete, blogs, blogsDS, editingBlog, fetchBlogs(), handleDeleteConfirm(), handleFormSubmit(), isDeleteConfirmOpen (+4 more)

### Community 60 - "brands/index.vue"
Cohesion: 0.14
Nodes (12): brandPendingDelete, brands, brandsDS, editingBrand, fetchBrands(), handleDeleteConfirm(), handleFormSubmit(), isDeleteConfirmOpen (+4 more)

### Community 61 - "stories/index.vue"
Cohesion: 0.14
Nodes (12): editingStory, fetchStories(), handleDeleteConfirm(), handleFormSubmit(), isDeleteConfirmOpen, isFormModalOpen, loading, stories (+4 more)

### Community 62 - "BannersController"
Cohesion: 0.17
Nodes (10): BannersController, Body, Controller, Delete, Get, Param, Patch, Post (+2 more)

### Community 63 - "QueryBlogDto"
Cohesion: 0.12
Nodes (15): Get, Query, QueryBlogDto, IsArray, IsBoolean, IsEnum, IsIn, IsNumber (+7 more)

### Community 64 - "main.ts"
Cohesion: 0.17
Nodes (8): Catch, AppModule, Module, HttpExceptionFilter, ResponseInterceptor, Injectable, bootstrap(), translateValidationMessage()

### Community 65 - "PublicStoryCarousel.vue"
Cohesion: 0.13
Nodes (6): dragStart, emit, isDragging, Props, scrollContainer, scrollStart

### Community 66 - "TAttributeValue"
Cohesion: 0.28
Nodes (4): AttributesService, TRawAttribute, TAttributeValue, TAttributeValuePayload

### Community 67 - "CategoryFormModal.vue"
Cohesion: 0.16
Nodes (13): categorySchema, emit, handleSubmit(), isEditing, modalDescription, modalOpen, modalTitle, normalizePayload() (+5 more)

### Community 68 - "favorites/types/index.type.ts"
Cohesion: 0.19
Nodes (6): FavoritesController, FavoritesService, TFavoriteItem, TFavoriteProduct, TFavoritesResponse, TFavoriteStatusResponse

### Community 69 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, format, lint, migration:revert, migration:run, start, start:debug (+7 more)

### Community 70 - "banners.controller.ts"
Cohesion: 0.23
Nodes (9): BannersModule, Module, CreateBannerDto, IsBoolean, IsOptional, IsString, IsUrl, MaxLength (+1 more)

### Community 72 - "1786500000000-AddRandomSpecsToProducts.ts"
Cohesion: 0.15
Nodes (10): AddRandomSpecsToProducts1786500000000, DIGITAL_GENERAL_POOL, HEADPHONE_POOL, KEYBOARD_POOL, LAPTOP_POOL, MOBILE_POOL, MONITOR_POOL, ProductRow (+2 more)

### Community 73 - "CreateBlogDto"
Cohesion: 0.18
Nodes (14): ArrayUnique, CreateBlogDto, CreateBlogSectionDto, ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsOptional (+6 more)

### Community 74 - "PublicBannerCarousel.vue"
Cohesion: 0.19
Nodes (11): activeBanners, currentBanner, currentIndex, goToNext(), goToPrevious(), goToSlide(), hasMultipleSlides, props (+3 more)

### Community 75 - "PublicProductFilters.vue"
Cohesion: 0.16
Nodes (9): clearFilters(), emit, props, searchInputModel, selectedBrandForSelect, selectedCategoryForSelect, sortedBrands, sortedCategories (+1 more)

### Community 76 - "AttributeValueFormModal.vue"
Cohesion: 0.18
Nodes (12): attributeValueSchema, emit, handleSubmit(), isEditing, modalOpen, modalTitle, normalizePayload(), props (+4 more)

### Community 77 - "files/index.vue"
Cohesion: 0.16
Nodes (11): fetchFiles(), filePendingDelete, files, filesDS, handleDeleteConfirm(), handleUpload(), isDeleteConfirmOpen, isUploadModalOpen (+3 more)

### Community 78 - "pages/index.vue"
Cohesion: 0.14
Nodes (9): banners, bannersDS, categories, categoriesDS, isStoryViewerOpen, selectedStoryIndex, stories, storiesDS (+1 more)

### Community 79 - "update.vue"
Cohesion: 0.18
Nodes (12): buildFileUrl(), config, form, onAvatarUpload(), profileDS, saveProfile(), saving, syncForm() (+4 more)

### Community 80 - "FavoritesController"
Cohesion: 0.18
Nodes (10): FavoritesController, Body, Controller, Get, HttpCode, Param, Post, Query (+2 more)

### Community 81 - "AttributeFormModal.vue"
Cohesion: 0.19
Nodes (11): attributeSchema, emit, handleSubmit(), isEditing, modalOpen, normalizePayload(), props, resetState() (+3 more)

### Community 82 - "TAttribute"
Cohesion: 0.26
Nodes (3): AttributesController, TAttribute, TAttributePayload

### Community 83 - "ChatMessageModel"
Cohesion: 0.19
Nodes (5): ChatMessageModel, ChatMessageReplyToModel, ChatMessageSenderModel, TChatMessageReplyTo, TChatMessageSender

### Community 84 - "jest"
Cohesion: 0.15
Nodes (13): js, json, **/*.(t|j)s, ts, jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions (+5 more)

### Community 85 - "FileController"
Cohesion: 0.19
Nodes (6): Res, FileController, Controller, Delete, Get, Param

### Community 86 - "auth.module.ts"
Cohesion: 0.19
Nodes (5): JwtStrategy, Inject, Injectable, LocalStrategy, Injectable

### Community 87 - "QueryProductDto"
Cohesion: 0.15
Nodes (13): QueryProductDto, IsArray, IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString (+5 more)

### Community 88 - "PublicStoryViewer.vue"
Cohesion: 0.21
Nodes (9): closeViewer(), currentIndex, currentStory, elapsed, emit, goToNextStory(), progress, Props (+1 more)

### Community 89 - "user/data/index.store.ts"
Cohesion: 0.21
Nodes (5): BaseStore, StoreInstance, stores, initialState, IUserProfileState

### Community 90 - "TBlog"
Cohesion: 0.24
Nodes (3): BlogsController, TBlog, TBlogPayload

### Community 91 - "CategoriesTable.vue"
Cohesion: 0.17
Nodes (7): currentPage, emit, paginatedCategories, props, totalItems, open, props

### Community 92 - "ProductsTable.vue"
Cohesion: 0.17
Nodes (5): currentPage, emit, paginatedProducts, props, totalItems

### Community 93 - "client/package.json"
Cohesion: 0.17
Nodes (11): name, packageManager, private, scripts, build, dev, lint, postinstall (+3 more)

### Community 97 - "QueryChatsDto"
Cohesion: 0.18
Nodes (8): ChatStatusFilter, QueryChatsDto, IsEnum, IsInt, IsOptional, Max, Min, Type

### Community 98 - "1786000000000-AddSpecificationsToProducts.ts"
Cohesion: 0.22
Nodes (6): AddSpecificationsToProducts1786000000000, DEFAULT_SPECS, LAPTOP_SPECS, MONITOR_SPECS, ProductRow, Specification

### Community 99 - "Story"
Cohesion: 0.18
Nodes (10): Story, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn (+2 more)

### Community 100 - "ProfileMenu.vue"
Cohesion: 0.20
Nodes (7): fullName, menuItems, profileDS, ProfileMenuItem, route, token, user

### Community 101 - "PublicCommentTextarea.vue"
Cohesion: 0.27
Nodes (9): autoResize(), emit, isFocused, isHovered, length, onInput(), onKeydown(), props (+1 more)

### Community 102 - "TCategory"
Cohesion: 0.33
Nodes (3): CategoriesController, TCategory, TCategoryPayload

### Community 104 - "server/README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 105 - "Banner"
Cohesion: 0.20
Nodes (9): InjectRepository, Banner, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn (+1 more)

### Community 106 - "ProfileShell.vue"
Cohesion: 0.22
Nodes (7): backTarget, isLoggedIn, profileDS, profileLoading, props, toast, token

### Community 107 - "BlogsTable.vue"
Cohesion: 0.22
Nodes (5): currentPage, emit, paginatedBlogs, props, totalItems

### Community 108 - "blogs/types/index.type.ts"
Cohesion: 0.47
Nodes (5): IBlogsState, BlogModel, TRawBlog, TBlogProductRef, TBlogSection

### Community 111 - "chat/index.vue"
Cohesion: 0.22
Nodes (6): chatDS, chats, loading, router, selectedFilter, toast

### Community 112 - "customers/index.ts"
Cohesion: 0.22
Nodes (8): GetCustomersResponse, IPaginatedData, IPaginationMeta, TAddCustomerPayload, TAddCustomerResponse, TCustomer, TServerResponse, UserType

### Community 113 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @nuxt/eslint, prettier, typescript, vue-tsc, prettier, typescript, @nuxt/eslint (+1 more)

### Community 114 - "devDependencies"
Cohesion: 0.22
Nodes (9): jest, devDependencies, jest, tsconfig-paths, @types/jest, @types/node, tsconfig-paths, @types/jest (+1 more)

### Community 115 - "JwtAuthGuard"
Cohesion: 0.31
Nodes (5): JwtAuthGuard, Injectable, FavoriteToggleDto, IsUUID, AuthenticatedRequest

### Community 116 - "BasePaginationFooter.vue"
Cohesion: 0.25
Nodes (7): currentPage, emit, pageCount, props, rangeEnd, rangeStart, safeTotal

### Community 117 - "PublicNavLinks.vue"
Cohesion: 0.36
Nodes (7): emit, getItemHash(), getItemPath(), handleNavigate(), isItemActive(), props, route

### Community 119 - "ChatMessageInput.vue"
Cohesion: 0.32
Nodes (6): emit, handleKeydown(), handleSend(), inputText, props, textareaRef

### Community 120 - "FileUploadModal.vue"
Cohesion: 0.29
Nodes (5): emit, modalOpen, props, selectedFile, submit()

### Community 122 - "[id].vue"
Cohesion: 0.25
Nodes (6): adminDS, adminId, chatDS, chatId, route, router

### Community 123 - "favorites.vue"
Cohesion: 0.25
Nodes (3): favorites, favoritesLoading, toast

### Community 124 - "Nuxt Dashboard Template"
Cohesion: 0.25
Nodes (7): Deploy your own, Development Server, Nuxt Dashboard Template, Production, Quick Start, Renovate integration, Setup

### Community 125 - "renovate.json"
Cohesion: 0.25
Nodes (7): extends, lockFileMaintenance, enabled, packageRules, postUpdateOptions, github>nuxt/renovate-config-nuxt, pnpmDedupe

### Community 126 - "exclude"
Cohesion: 0.25
Nodes (7): dist, node_modules, **/*spec.ts, test, ./tsconfig.json, exclude, extends

### Community 127 - "dbConfig.ts"
Cohesion: 0.29
Nodes (6): dataSource, dbPort, migrationPaths, pgConfig, pgConnectionConfig, pgMigrationConfig

### Community 129 - "UpdateStoryDto"
Cohesion: 0.25
Nodes (7): IsBoolean, IsInt, IsOptional, IsString, Length, Min, UpdateStoryDto

### Community 130 - "PublicActiveFilterChips.vue"
Cohesion: 0.29
Nodes (6): attributeChips, emit, hasActiveFilters, props, selectedBrand, selectedCategory

### Community 131 - "PublicProductCard.vue"
Cohesion: 0.29
Nodes (5): discountPercent, displayPrice, hasDiscount, mainImageUrl, props

### Community 132 - "attributes/data/index.store.ts"
Cohesion: 0.48
Nodes (3): IAttributesState, AttributeModel, AttributeValueModel

### Community 133 - "server/package.json"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 135 - "QueryMessagesDto"
Cohesion: 0.29
Nodes (6): QueryMessagesDto, IsInt, IsOptional, Max, Min, Type

### Community 136 - "BasePageHeader.vue"
Cohesion: 0.33
Nodes (5): breadcrumbItems, pageTitle, props, route, segmentLabels

### Community 137 - "AttributesTable.vue"
Cohesion: 0.33
Nodes (5): currentPage, emit, paginatedAttributes, props, totalItems

### Community 138 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 139 - "app.vue"
Cohesion: 0.40
Nodes (4): color, colorMode, isNoindexPage, route

### Community 140 - "PublicMobileMenu.vue"
Cohesion: 0.40
Nodes (3): emit, openModel, props

### Community 141 - "textEditor/index.vue"
Cohesion: 0.40
Nodes (4): editor, emit, props, tools

### Community 142 - "navigation.ts"
Cohesion: 0.50
Nodes (3): AppNavigationItem, navigation, links

### Community 143 - "AttributeDeleteConfirmModal.vue"
Cohesion: 0.40
Nodes (3): emit, modalOpen, props

### Community 144 - "AttributeValueDeleteConfirmModal.vue"
Cohesion: 0.40
Nodes (3): emit, modalOpen, props

### Community 145 - "BlogDeleteConfirmModal.vue"
Cohesion: 0.50
Nodes (4): emit, handleConfirm(), modalOpen, props

### Community 146 - "CategoryDeleteConfirmModal.vue"
Cohesion: 0.40
Nodes (3): emit, modalOpen, props

### Community 147 - "TProductAttributeWithValues"
Cohesion: 0.50
Nodes (3): ProductAttributeRefModel, TProductAttributeRef, TProductAttributeWithValues

### Community 148 - ".upload"
Cohesion: 0.40
Nodes (3): Post, UploadedFile, UseInterceptors

### Community 152 - "PublicProductGallery.vue"
Cohesion: 0.50
Nodes (3): emit, mainImageUrl, props

### Community 154 - "ProductDeleteConfirmModal.vue"
Cohesion: 0.50
Nodes (3): emit, modalOpen, props

### Community 155 - "user.ts"
Cohesion: 0.50
Nodes (3): TResponseServer, TRole, TUser

### Community 156 - "CreateDto"
Cohesion: 0.50
Nodes (3): CreateDto, IsString, Length

## Knowledge Gaps
- **729 isolated node(s):** `colorMode`, `route`, `isNoindexPage`, `color`, `Props` (+724 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **92 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `StoreManager` connect `StoreManager` to `AdminDS`, `FilesDS`, `UserProfileDS`, `TProduct`, `CartDS`, `TAdmin`, `user/data/index.store.ts`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `AttributesDS` connect `AttributesDS` to `TAttributeValue`, `attributes/data/index.store.ts`, `StoreManager`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `colorMode`, `route`, `isNoindexPage` to the rest of the system?**
  _729 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TargetType` be split into smaller, more focused modules?**
  _Cohesion score 0.050616050616050616 - nodes in this community are weakly interconnected._
- **Should `TBanner` be split into smaller, more focused modules?**
  _Cohesion score 0.053939714436805924 - nodes in this community are weakly interconnected._
- **Should `TStory` be split into smaller, more focused modules?**
  _Cohesion score 0.05552617662612375 - nodes in this community are weakly interconnected._
- **Should `TBrand` be split into smaller, more focused modules?**
  _Cohesion score 0.055191256830601096 - nodes in this community are weakly interconnected._