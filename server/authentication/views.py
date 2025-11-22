from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, extend_schema_serializer

User = get_user_model()

class LoginOrRegisterView(APIView):
    """this view gets/creates the user automatically
    
    returns:
    - message: the action that happened
    - user_id: the id of the user
    - email: the email of the user
    - tokens: the access and refresh tokens
    """

    @extend_schema_serializer(component_name="LoginInputSerializer")
    class InputSerializer(serializers.Serializer):
        email = serializers.EmailField()
        password = serializers.CharField(write_only=True)

    @extend_schema_serializer(component_name="LoginResponseSerializer")
    class OutputSerializer(serializers.Serializer):
        message = serializers.CharField()
        user_id = serializers.IntegerField()
        email = serializers.EmailField()
        tokens = serializers.DictField(
            child=serializers.CharField(),
            help_text="Contains 'access' and 'refresh' tokens"
        )


    @extend_schema(
        summary="Process User Login/Registration",
        description="Checks if email exists. If yes, logs in. If no, registers new user.",
        tags=['Auth'],
        request=InputSerializer,
        responses={
            200: OutputSerializer,
            400: {"description": "Validation Error (e.g. missing fields)"},
            401: {"description": "Invalid Credentials (Login failed)"},
            500: {"description": "Server Error"}
        }
    )
    def post(self, request):
        input_serializer = self.InputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        email = input_serializer.validated_data['email']
        password = input_serializer.validated_data['password']

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
        response_data = {
            "message": action,
            "user_id": user.id,
            "email": user.email,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }

        serializer = self.OutputSerializer(data=response_data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)