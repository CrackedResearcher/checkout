from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class LoginOrRegisterView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # check if user exists
        if User.objects.filter(email=email).exists():
            # --- LOGIN PATH ---
            # user exists, so we check if the password is correct
            user = authenticate(username=email, password=password)
            
            if user is None:
                # user exists but typed wrong password
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
            action = "Logged in"

        else:
            # --- REGISTER PATH ---
            # user does not exist, create them safely
            try:
                # create_user handles password hashing automatically
                user = User.objects.create_user(email=email, password=password)
                action = "Registered new user"
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. generate tokens 
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": action,
            "user_id": user.id,
            "email": user.email,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_200_OK)